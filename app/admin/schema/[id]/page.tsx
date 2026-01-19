"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  collection,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Loader2,
  GripVertical,
  ChevronDown,
  Type,
  AlignLeft,
  FileText,
  Hash,
  Percent,
  ToggleLeft,
  Calendar,
  Clock,
  Clock3,
  Mail,
  Lock,
  Fingerprint,
  Braces,
  List,
  Image,
  Link2,
  Component,
  Layers,
  Settings2,
} from "lucide-react";
import Link from "next/link";
import clsx from "clsx";
import { toast } from "@/components/ui/Toast";
import {
  FieldType,
  FIELD_TYPE_CONFIG,
  Field,
  ComponentDefinition,
} from "@/lib/types";

const FIELD_ICONS: Record<FieldType, React.ElementType> = {
  text: Type,
  textarea: AlignLeft,
  richtext: FileText,
  number: Hash,
  decimal: Percent,
  boolean: ToggleLeft,
  date: Calendar,
  datetime: Clock,
  time: Clock3,
  email: Mail,
  password: Lock,
  uid: Fingerprint,
  json: Braces,
  enumeration: List,
  media: Image,
  relation: Link2,
  component: Component,
  dynamiczone: Layers,
};

import SchemaEmptyState from "@/components/cms/SchemaEmptyState";
import FieldModal from "@/components/cms/FieldModal";
import FieldConfigModal from "@/components/cms/FieldConfigModal";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableField } from "@/components/cms/SortableField";
import { reorder } from "@/lib/utils";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface SchemaForm {
  label: string;
  slug: string;
  kind: "collectionType" | "singleType" | "component";
  category?: string;
  draftAndPublish: boolean;
  fields: Field[];
}

interface CollectionOption {
  slug: string;
  label: string;
}

export default function SchemaEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const isNew = id === "new";
  const router = useRouter();
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [manuallyEditedKeys, setManuallyEditedKeys] = useState<
    Record<string, boolean>
  >({});
  const [expandedFields, setExpandedFields] = useState<Record<string, boolean>>(
    {}
  );
  const [collections, setCollections] = useState<CollectionOption[]>([]);
  const [components, setComponents] = useState<ComponentDefinition[]>([]);
  const [showFieldPicker, setShowFieldPicker] = useState(false);
  
  // Configuration Modal State
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [editingFieldIndex, setEditingFieldIndex] = useState<number | null>(null);
  const [currentFieldConfig, setCurrentFieldConfig] = useState<Field | null>(null);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SchemaForm>({
    defaultValues: {
      label: "",
      slug: "",
      kind: "collectionType",
      draftAndPublish: false,
      fields: [],
    },
  });

  const { fields, append, remove, move, update } = useFieldArray({
    control,
    name: "fields",
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((f) => f.id === active.id);
      const newIndex = fields.findIndex((f) => f.id === over.id);
      move(oldIndex, newIndex);
    }
  };

  // Fetch collections for relation fields
  useEffect(() => {
    const q = query(collection(db, "_collections"), orderBy("label"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const cols = snapshot.docs.map((doc) => ({
        slug: doc.id,
        label: doc.data().label,
      }));
      setCollections(cols);
    });
    return () => unsubscribe();
  }, []);

  // Fetch components for component fields
  useEffect(() => {
    const q = query(collection(db, "_components"), orderBy("displayName"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const comps = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ComponentDefinition[];
      setComponents(comps);
    });
    return () => unsubscribe();
  }, []);

  // Auto-generate slug from label if new
  const labelValue = watch("label");
  useEffect(() => {
    if (isNew && labelValue) {
      const slug = labelValue
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setValue("slug", slug);
    }
  }, [labelValue, isNew, setValue]);

  // Helper to generate camelCase key from label
  const generateKey = (label: string) => {
    return label
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase())
      .replace(/[^a-zA-Z0-9]/g, "")
      .replace(/^(.)/, (c) => c.toLowerCase());
  };

  useEffect(() => {
    if (isNew) return;

    const fetchData = async () => {
      try {
        // Try looking in collections first
        const collectionRef = doc(db, "_collections", id);
        const collectionSnap = await getDoc(collectionRef);

        if (collectionSnap.exists()) {
          const data = collectionSnap.data() as SchemaForm;
          setValue("label", data.label);
          setValue("slug", data.slug);
          setValue("kind", data.kind || "collectionType");
          setValue("draftAndPublish", data.draftAndPublish || false);
          setValue("fields", data.fields || []);
        } else {
          // If not in collections, check components
          const componentRef = doc(db, "_components", id);
          const componentSnap = await getDoc(componentRef);

          if (componentSnap.exists()) {
            const data = componentSnap.data() as ComponentDefinition;
            setValue("label", data.displayName);
            setValue("slug", data.id); // or name? id seems to be used as slug
            setValue("kind", "component");
            setValue("category", data.category);
            setValue("draftAndPublish", false);
            setValue("fields", data.fields || []);
          }
        }
      } catch (error) {
        console.error("Error fetching schema:", error);
        toast.error("Failed to load schema");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isNew, setValue]);

  const onSubmit = async (data: SchemaForm) => {
    setSaving(true);
    try {
      const docId = isNew ? data.slug : id;

      // Remove undefined values from data
      const sanitizedData = JSON.parse(JSON.stringify(data));

      if (data.kind === "component") {
        const componentData: ComponentDefinition = {
          id: docId,
          name: data.slug,
          displayName: data.label,
          category: data.category || "General",
          fields: sanitizedData.fields,
          updatedAt: new Date(),
        };

        await setDoc(doc(db, "_components", docId), {
          ...componentData,
          updatedAt: serverTimestamp(),
          ...(isNew && { createdAt: serverTimestamp() }),
        });
      } else {
        await setDoc(doc(db, "_collections", docId), {
          ...sanitizedData,
          updatedAt: serverTimestamp(),
          ...(isNew && { createdAt: serverTimestamp() }),
        });
      }

      toast.success(isNew ? "Content type created!" : "Content type updated!");
      
      if (isNew) {
        router.replace(`/admin/schema/${docId}`);
      }
    } catch (error) {
      console.error("Error saving schema:", error);
      toast.error("Failed to save schema");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveField = (fieldData: Field) => {
    // Check for duplicate Field Key (API ID)
    const isDuplicate = watch("fields").some(
      (f, idx) => f.name === fieldData.name && idx !== editingFieldIndex
    );

    if (isDuplicate) {
      toast.error(`Field key "${fieldData.name}" already exists. Please use a unique key.`);
      return;
    }

    if (editingFieldIndex !== null) {
      update(editingFieldIndex, fieldData);
    } else {
      append(fieldData);
    }
    setConfigModalOpen(false);
    setEditingFieldIndex(null);
    setCurrentFieldConfig(null);
  };

  const addField = (type: FieldType) => {
    const newField: Field = {
      name: "",
      label: "",
      type,
      required: false,
    };

    // Add type-specific defaults
    if (type === "enumeration") {
      newField.enumOptions = [{ label: "Option 1", value: "option1" }];
    } else if (type === "relation") {
      newField.relation = {
        type: "hasOne",
        target: collections[0]?.slug || "",
      };
    } else if (type === "component") {
      newField.component = {
        component: components[0]?.id || "",
        repeatable: false,
      };
    } else if (type === "dynamiczone") {
      newField.dynamiczone = {
        components: [],
      };
    }

    setCurrentFieldConfig(newField);
    setEditingFieldIndex(null); // New field
    setShowFieldPicker(false);
    setConfigModalOpen(true);
  };

  const toggleFieldExpand = (index: string) => {
    setExpandedFields((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  if (loading) {
    return (
      <div className='flex justify-center p-8 h-96 items-center'>
        <Loader2 className='w-8 h-8 animate-spin text-blue-600' />
      </div>
    );
  }

  const fieldCategories = [
    {
      name: "Text",
      types: [
        "text",
        "textarea",
        "richtext",
        "email",
        "password",
        "uid",
      ] as FieldType[],
    },
    {
      name: "Number",
      types: ["number", "decimal"] as FieldType[],
    },
    {
      name: "Date & Time",
      types: ["date", "datetime", "time"] as FieldType[],
    },
    {
      name: "Other",
      types: ["boolean", "enumeration", "json", "media"] as FieldType[],
    },
    {
      name: "Components",
      types: ["component", "dynamiczone"] as FieldType[],
    },
    {
      name: "Relation",
      types: ["relation"] as FieldType[],
    },
  ];

  return (
    <div className='max-w-5xl mx-auto'>
      <div className='flex items-center gap-4 mb-8'>
        <Link
          href='/admin/schema'
          className='p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors'>
          <ArrowLeft className='w-5 h-5' />
        </Link>
        <div>
          <h1 className='text-2xl font-bold text-gray-900 tracking-tight'>
            {isNew ? "Create Content Type" : "Edit Content Type"}
          </h1>
          <p className='text-sm text-gray-500 mt-1'>
            Define the structure for your content.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className='space-y-8'>
        {/* Basic Info */}
        <div className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden'>
          <div className='p-6 border-b border-gray-200 bg-gray-50/50'>
            <h2 className='text-base font-semibold text-gray-900'>
              Basic Information
            </h2>
          </div>
          <div className='p-6 grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <label className='block text-sm font-semibold text-gray-700 mb-2'>
                Display Name
              </label>
              <input
                {...register("label", { required: true })}
                className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-gray-900 placeholder:text-gray-400'
                placeholder='e.g. Blog Posts'
              />
              {errors.label && (
                <p className='text-red-500 text-xs mt-1.5'>Label is required</p>
              )}
            </div>
            <div>
              <label className='block text-sm font-semibold text-gray-700 mb-2'>
                API ID (Slug)
              </label>
              <input
                {...register("slug", { required: true })}
                readOnly={!isNew}
                className={clsx(
                  "w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-gray-900 placeholder:text-gray-400",
                  !isNew && "bg-gray-100 text-gray-500 cursor-not-allowed"
                )}
                placeholder='e.g. blog-posts'
              />
            </div>
            <div>
              <label className='block text-sm font-semibold text-gray-700 mb-2'>
                Content Type
              </label>
              <Controller
                name='kind'
                control={control}
                render={({ field }) => (
                  <div className='flex gap-4 flex-wrap'>
                    <label className='flex items-center gap-2 cursor-pointer group'>
                      <input
                        type='radio'
                        {...field}
                        value='collectionType'
                        checked={field.value === "collectionType"}
                        className='w-4 h-4 border-gray-300 accent-blue-600'
                      />
                      <span className='text-sm text-gray-700 group-hover:text-blue-600 transition-colors'>
                        Collection Type
                      </span>
                    </label>
                    <label className='flex items-center gap-2 cursor-pointer group'>
                      <input
                        type='radio'
                        {...field}
                        value='singleType'
                        checked={field.value === "singleType"}
                        className='w-4 h-4 border-gray-300 accent-blue-600'
                      />
                      <span className='text-sm text-gray-700 group-hover:text-blue-600 transition-colors'>Single Type</span>
                    </label>
                    <label className='flex items-center gap-2 cursor-pointer group'>
                      <input
                        type='radio'
                        {...field}
                        value='component'
                        checked={field.value === "component"}
                        className='w-4 h-4 border-gray-300 accent-blue-600'
                      />
                      <span className='text-sm text-gray-700 group-hover:text-blue-600 transition-colors'>Component</span>
                    </label>
                  </div>
                )}
              />
              <p className='text-xs text-gray-500 mt-1.5'>
                {watch("kind") === "collectionType"
                  ? "Multiple entries (e.g., Blog Posts, Products)"
                  : watch("kind") === "singleType"
                  ? "Single entry (e.g., Homepage, Settings)"
                  : "Reusable structure for other content types"}
              </p>
            </div>

            {watch("kind") === "component" && (
              <div>
                <label className='block text-sm font-semibold text-gray-700 mb-2'>
                  Category
                </label>
                <input
                  {...register("category", { required: true })}
                  className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-gray-900 placeholder:text-gray-400'
                  placeholder='e.g. Shared, SEO, Blocks'
                />
                {errors.category && (
                  <p className='text-red-500 text-xs mt-1.5'>
                    Category is required
                  </p>
                )}
              </div>
            )}

            {watch("kind") !== "component" && (
              <div className='flex items-center'>
                <Controller
                  name="draftAndPublish"
                  control={control}
                  render={({ field: f }) => (
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="draftAndPublish"
                        checked={f.value}
                        onCheckedChange={f.onChange}
                      />
                      <div>
                        <label htmlFor="draftAndPublish" className='text-sm font-medium text-gray-700 cursor-pointer'>
                          Enable Draft/Publish
                        </label>
                        <p className='text-xs text-gray-500'>
                          Content must be published to appear in API
                        </p>
                      </div>
                    </div>
                  )}
                />
              </div>
            )}
          </div>
        </div>

        {/* Fields Builder */}
        <div className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden'>
          <div className='p-6 border-b border-gray-200 bg-gray-50/50 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4'>
            <div>
              <h2 className='text-base font-semibold text-gray-900'>
                Fields Structure
              </h2>
              <p className='text-sm text-gray-500 mt-0.5'>
                Add and configure fields for your content type.
              </p>
            </div>
            <div className='relative w-full sm:w-auto'>
              <button
                type='button'
                onClick={() => setShowFieldPicker(true)}
                className='w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 sm:py-2 rounded-lg text-sm font-medium transition-colors shadow-sm'>
                <Plus className='w-4 h-4' /> Add Field
              </button>

              <FieldModal
                isOpen={showFieldPicker}
                onClose={() => setShowFieldPicker(false)}
                onSelect={(type) => {
                  addField(type);
                }}
              />
            </div>
          </div>

          <div className='p-6 space-y-3'>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}>
              <SortableContext
                items={fields.map((f) => f.id)}
                strategy={verticalListSortingStrategy}>
                {fields.map((field, index) => {
                  const Icon =
                    FIELD_ICONS[field.type as FieldType] || Settings2;
                  return (
                                        <SortableField
                                          key={field.id}
                                          id={field.id}
                                          index={index}
                                          field={field}
                                          isExpanded={false} // Disable expansion
                                          onToggleExpand={() => {}} // Disable expansion toggle
                                          onRemove={remove}
                                          Icon={Icon}
                                          onEdit={(idx) => {
                                            setCurrentFieldConfig(fields[idx]);
                                            setEditingFieldIndex(idx);
                                            setConfigModalOpen(true);
                                          }}
                                          renderSettings={() => null}
                                        />
                                      );
                                    })}
                                  </SortableContext>
                                </DndContext>
                    
                                {fields.length === 0 && (
                                  <SchemaEmptyState onAddField={() => setShowFieldPicker(true)} />
                                )}
                              </div>
                            </div>
                    
                            <div className='flex justify-end pt-4 pb-20'>
                              <Link
                                href='/admin/schema'
                                className='px-6 py-2.5 mr-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-all'>
                                Cancel
                              </Link>
                              <button
                                type='submit'
                                disabled={saving}
                                className='bg-blue-600 text-white px-8 py-2.5 rounded-lg font-medium hover:bg-blue-700 focus:ring-4 focus:ring-blue-500/20 transition-all flex items-center gap-2 disabled:bg-blue-400 disabled:cursor-not-allowed shadow-lg shadow-blue-600/20'>
                                {saving ? (
                                  <>
                                    <Loader2 className='w-4 h-4 animate-spin' />
                                    Saving...
                                  </>
                                ) : (
                                  <>
                                    <Save className='w-4 h-4' />
                                    Save Content Type
                                  </>
                                )}
                              </button>
                            </div>
                          </form>
                    
                          {/* Click outside to close field picker */}
                          {showFieldPicker && (
                            <div
                              className='fixed inset-0 z-40'
                              onClick={() => setShowFieldPicker(false)}
                            />
                          )}
                    
                          <FieldConfigModal
                            isOpen={configModalOpen}
                            field={currentFieldConfig}
                            onClose={() => setConfigModalOpen(false)}
                            onSave={handleSaveField}
                            collections={collections}
                            components={components.map((c) => ({
                              id: c.id,
                              displayName: c.displayName,
                            }))}
                          />
                        </div>
                      );
                    }
                    
