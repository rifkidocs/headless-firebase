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

  const { fields, append, remove } = useFieldArray({
    control,
    name: "fields",
  });

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

      if (data.kind === "component") {
        const componentData: ComponentDefinition = {
          id: docId,
          name: data.slug,
          displayName: data.label,
          category: data.category || "General",
          fields: data.fields,
          updatedAt: new Date(),
        };

        await setDoc(doc(db, "_components", docId), {
          ...componentData,
          updatedAt: serverTimestamp(),
          ...(isNew && { createdAt: serverTimestamp() }),
        });
      } else {
        await setDoc(doc(db, "_collections", docId), {
          ...data,
          updatedAt: serverTimestamp(),
          ...(isNew && { createdAt: serverTimestamp() }),
        });
      }

      toast.success(isNew ? "Content type created!" : "Content type updated!");
      router.push("/admin/schema");
    } catch (error) {
      console.error("Error saving schema:", error);
      toast.error("Failed to save schema");
    } finally {
      setSaving(false);
    }
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

    append(newField);
    setShowFieldPicker(false);

    // Auto-expand new field
    setTimeout(() => {
      setExpandedFields((prev) => ({
        ...prev,
        [fields.length.toString()]: true,
      }));
    }, 0);
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
                    <label className='flex items-center gap-2 cursor-pointer'>
                      <input
                        type='radio'
                        {...field}
                        value='collectionType'
                        checked={field.value === "collectionType"}
                        className='w-4 h-4 text-blue-600'
                      />
                      <span className='text-sm text-gray-700'>
                        Collection Type
                      </span>
                    </label>
                    <label className='flex items-center gap-2 cursor-pointer'>
                      <input
                        type='radio'
                        {...field}
                        value='singleType'
                        checked={field.value === "singleType"}
                        className='w-4 h-4 text-blue-600'
                      />
                      <span className='text-sm text-gray-700'>Single Type</span>
                    </label>
                    <label className='flex items-center gap-2 cursor-pointer'>
                      <input
                        type='radio'
                        {...field}
                        value='component'
                        checked={field.value === "component"}
                        className='w-4 h-4 text-blue-600'
                      />
                      <span className='text-sm text-gray-700'>Component</span>
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
                <label className='flex items-center gap-3 cursor-pointer'>
                  <input
                    type='checkbox'
                    {...register("draftAndPublish")}
                    className='w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500'
                  />
                  <div>
                    <span className='text-sm font-medium text-gray-700'>
                      Enable Draft/Publish
                    </span>
                    <p className='text-xs text-gray-500'>
                      Content must be published to appear in API
                    </p>
                  </div>
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Fields Builder */}
        <div className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden'>
          <div className='p-6 border-b border-gray-200 bg-gray-50/50 flex justify-between items-center'>
            <div>
              <h2 className='text-base font-semibold text-gray-900'>
                Fields Structure
              </h2>
              <p className='text-sm text-gray-500 mt-0.5'>
                Add and configure fields for your content type.
              </p>
            </div>
            <div className='relative'>
              <button
                type='button'
                onClick={() => setShowFieldPicker(true)}
                className='inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm'>
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
            {fields.map((field, index) => {
              const Icon = FIELD_ICONS[field.type as FieldType] || Settings2;
              const config = FIELD_TYPE_CONFIG[field.type as FieldType];
              const isExpanded = expandedFields[index.toString()];

              return (
                <div
                  key={field.id}
                  className='group relative bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all overflow-hidden'>
                  {/* Field Header */}
                  <div
                    className='flex items-center gap-3 p-4 cursor-pointer'
                    onClick={() => toggleFieldExpand(index.toString())}>
                    <div className='text-gray-400 cursor-grab active:cursor-grabbing'>
                      <GripVertical className='w-5 h-5' />
                    </div>
                    <div className='p-2 rounded-lg bg-gray-100'>
                      <Icon className='w-4 h-4 text-gray-600' />
                    </div>
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-center gap-2'>
                        <span className='font-medium text-gray-900'>
                          {watch(`fields.${index}.label`) || "Untitled Field"}
                        </span>
                        {watch(`fields.${index}.required`) && (
                          <span className='text-xs text-red-500'>*</span>
                        )}
                      </div>
                      <p className='text-xs text-gray-500'>
                        {config?.label || field.type} •{" "}
                        {watch(`fields.${index}.name`) || "no-key"}
                      </p>
                    </div>
                    <button
                      type='button'
                      onClick={(e) => {
                        e.stopPropagation();
                        remove(index);
                      }}
                      className='p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100'>
                      <Trash2 className='w-4 h-4' />
                    </button>
                    <ChevronDown
                      className={clsx(
                        "w-5 h-5 text-gray-400 transition-transform",
                        isExpanded && "rotate-180"
                      )}
                    />
                  </div>

                  {/* Field Settings */}
                  {isExpanded && (
                    <div className='border-t border-gray-200 p-4 bg-gray-50/50 space-y-4'>
                      <div className='grid grid-cols-2 gap-4'>
                        <div>
                          <label className='block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5'>
                            Label
                          </label>
                          <input
                            {...register(`fields.${index}.label` as const, {
                              required: true,
                              onChange: (e) => {
                                if (!manuallyEditedKeys[field.id]) {
                                  setValue(
                                    `fields.${index}.name`,
                                    generateKey(e.target.value)
                                  );
                                }
                              },
                            })}
                            className='w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-gray-900 placeholder:text-gray-400'
                            placeholder='e.g. Article Title'
                          />
                        </div>
                        <div>
                          <label className='block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5'>
                            Field Key
                          </label>
                          <input
                            {...register(`fields.${index}.name` as const, {
                              required: true,
                              onChange: () => {
                                setManuallyEditedKeys((prev) => ({
                                  ...prev,
                                  [field.id]: true,
                                }));
                              },
                            })}
                            className='w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none font-mono text-gray-900 placeholder:text-gray-400'
                            placeholder='camelCase'
                          />
                        </div>
                      </div>

                      {/* Options row */}
                      <div className='flex flex-wrap gap-4'>
                        <label className='flex items-center gap-2 cursor-pointer'>
                          <input
                            type='checkbox'
                            {...register(`fields.${index}.required` as const)}
                            className='w-4 h-4 text-blue-600 rounded border-gray-300'
                          />
                          <span className='text-sm text-gray-700'>
                            Required
                          </span>
                        </label>
                        <label className='flex items-center gap-2 cursor-pointer'>
                          <input
                            type='checkbox'
                            {...register(`fields.${index}.unique` as const)}
                            className='w-4 h-4 text-blue-600 rounded border-gray-300'
                          />
                          <span className='text-sm text-gray-700'>Unique</span>
                        </label>
                        <label className='flex items-center gap-2 cursor-pointer'>
                          <input
                            type='checkbox'
                            {...register(`fields.${index}.private` as const)}
                            className='w-4 h-4 text-blue-600 rounded border-gray-300'
                          />
                          <span className='text-sm text-gray-700'>
                            Private (hide in API)
                          </span>
                        </label>
                      </div>

                      {/* Type-specific settings */}
                      {(field.type === "text" || field.type === "textarea") && (
                        <div className='grid grid-cols-2 gap-4'>
                          <div>
                            <label className='block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5'>
                              Min Length
                            </label>
                            <input
                              type='number'
                              {...register(
                                `fields.${index}.minLength` as const,
                                { valueAsNumber: true }
                              )}
                              className='w-full px-3 py-2 text-sm border border-gray-300 rounded-md text-gray-900'
                              placeholder='0'
                            />
                          </div>
                          <div>
                            <label className='block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5'>
                              Max Length
                            </label>
                            <input
                              type='number'
                              {...register(
                                `fields.${index}.maxLength` as const,
                                { valueAsNumber: true }
                              )}
                              className='w-full px-3 py-2 text-sm border border-gray-300 rounded-md text-gray-900'
                              placeholder='Unlimited'
                            />
                          </div>
                        </div>
                      )}

                      {(field.type === "number" ||
                        field.type === "decimal") && (
                        <div className='grid grid-cols-2 gap-4'>
                          <div>
                            <label className='block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5'>
                              Minimum
                            </label>
                            <input
                              type='number'
                              {...register(`fields.${index}.min` as const, {
                                valueAsNumber: true,
                              })}
                              className='w-full px-3 py-2 text-sm border border-gray-300 rounded-md text-gray-900'
                            />
                          </div>
                          <div>
                            <label className='block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5'>
                              Maximum
                            </label>
                            <input
                              type='number'
                              {...register(`fields.${index}.max` as const, {
                                valueAsNumber: true,
                              })}
                              className='w-full px-3 py-2 text-sm border border-gray-300 rounded-md text-gray-900'
                            />
                          </div>
                        </div>
                      )}

                      {field.type === "enumeration" && (
                        <div>
                          <label className='block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2'>
                            Options
                          </label>
                          <Controller
                            name={`fields.${index}.enumOptions`}
                            control={control}
                            render={({ field: enumField }) => (
                              <div className='space-y-2'>
                                {(enumField.value || []).map(
                                  (option, optIndex) => (
                                    <div key={optIndex} className='flex gap-2'>
                                      <input
                                        value={option.label}
                                        onChange={(e) => {
                                          const newOptions = [
                                            ...(enumField.value || []),
                                          ];
                                          newOptions[optIndex] = {
                                            ...newOptions[optIndex],
                                            label: e.target.value,
                                            value: e.target.value
                                              .toLowerCase()
                                              .replace(/\s+/g, "_"),
                                          };
                                          enumField.onChange(newOptions);
                                        }}
                                        className='flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md text-gray-900'
                                        placeholder='Option label'
                                      />
                                      <button
                                        type='button'
                                        onClick={() => {
                                          const newOptions = (
                                            enumField.value || []
                                          ).filter((_, i) => i !== optIndex);
                                          enumField.onChange(newOptions);
                                        }}
                                        className='p-2 text-gray-400 hover:text-red-500'>
                                        <Trash2 className='w-4 h-4' />
                                      </button>
                                    </div>
                                  )
                                )}
                                <button
                                  type='button'
                                  onClick={() => {
                                    enumField.onChange([
                                      ...(enumField.value || []),
                                      { label: "", value: "" },
                                    ]);
                                  }}
                                  className='text-sm text-blue-600 hover:text-blue-700 font-medium'>
                                  + Add option
                                </button>
                              </div>
                            )}
                          />
                        </div>
                      )}

                      {field.type === "relation" && (
                        <div className='grid grid-cols-2 gap-4'>
                          <div>
                            <label className='block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5'>
                              Relation Type
                            </label>
                            <select
                              {...register(
                                `fields.${index}.relation.type` as const
                              )}
                              className='w-full px-3 py-2 text-sm border border-gray-300 rounded-md text-gray-900'>
                              <option value='hasOne'>Has One</option>
                              <option value='hasMany'>Has Many</option>
                              <option value='belongsTo'>Belongs To</option>
                              <option value='manyToMany'>Many to Many</option>
                            </select>
                          </div>
                          <div>
                            <label className='block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5'>
                              Related To
                            </label>
                            <select
                              {...register(
                                `fields.${index}.relation.target` as const
                              )}
                              className='w-full px-3 py-2 text-sm border border-gray-300 rounded-md text-gray-900'>
                              {collections.map((col) => (
                                <option key={col.slug} value={col.slug}>
                                  {col.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      )}

                      {field.type === "component" && (
                        <div className='flex flex-col gap-4'>
                          <div>
                            <label className='block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5'>
                              Component
                            </label>
                            <select
                              {...register(
                                `fields.${index}.component.component` as const
                              )}
                              className='w-full px-3 py-2 text-sm border border-gray-300 rounded-md text-gray-900'>
                              {components.map((comp) => (
                                <option key={comp.id} value={comp.id}>
                                  {comp.displayName}
                                </option>
                              ))}
                            </select>
                            {components.length === 0 && (
                              <p className='text-xs text-red-500 mt-1'>
                                No components found.{" "}
                                <Link
                                  href='/admin/components/new'
                                  target='_blank'
                                  className='underline hover:text-red-600'>
                                  Create one first
                                </Link>
                                .
                              </p>
                            )}
                          </div>

                          <div>
                            <label className='block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5'>
                              Type
                            </label>
                            <div className='flex gap-4'>
                              <label
                                className={`flex-1 p-3 border rounded-lg cursor-pointer transition-all ${
                                  !watch(`fields.${index}.component.repeatable`)
                                    ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500"
                                    : "border-gray-200 hover:border-gray-300"
                                }`}>
                                <div className='flex items-center gap-3'>
                                  <input
                                    type='radio'
                                    value='single'
                                    className='sr-only'
                                    onChange={() =>
                                      setValue(
                                        `fields.${index}.component.repeatable`,
                                        false
                                      )
                                    }
                                    checked={
                                      !watch(
                                        `fields.${index}.component.repeatable`
                                      )
                                    }
                                  />
                                  <div className='p-2 bg-white rounded-md border border-gray-200'>
                                    <Component className='w-4 h-4 text-gray-600' />
                                  </div>
                                  <div>
                                    <p className='text-sm font-medium text-gray-900'>
                                      Single component
                                    </p>
                                    <p className='text-xs text-gray-500'>
                                      Best for fixed structures like SEO, Header
                                    </p>
                                  </div>
                                </div>
                              </label>

                              <label
                                className={`flex-1 p-3 border rounded-lg cursor-pointer transition-all ${
                                  watch(`fields.${index}.component.repeatable`)
                                    ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500"
                                    : "border-gray-200 hover:border-gray-300"
                                }`}>
                                <div className='flex items-center gap-3'>
                                  <input
                                    type='radio'
                                    value='repeatable'
                                    className='sr-only'
                                    onChange={() =>
                                      setValue(
                                        `fields.${index}.component.repeatable`,
                                        true
                                      )
                                    }
                                    checked={watch(
                                      `fields.${index}.component.repeatable`
                                    )}
                                  />
                                  <div className='p-2 bg-white rounded-md border border-gray-200'>
                                    <Layers className='w-4 h-4 text-gray-600' />
                                  </div>
                                  <div>
                                    <p className='text-sm font-medium text-gray-900'>
                                      Repeatable component
                                    </p>
                                    <p className='text-xs text-gray-500'>
                                      Best for lists like Slider, Testimonials
                                    </p>
                                  </div>
                                </div>
                              </label>
                            </div>
                          </div>
                        </div>
                      )}

                      {field.type === "uid" && (
                        <div>
                          <label className='block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5'>
                            Generate from field
                          </label>
                          <select
                            {...register(
                              `fields.${index}.targetField` as const
                            )}
                            className='w-full px-3 py-2 text-sm border border-gray-300 rounded-md text-gray-900'>
                            <option value=''>Select a field</option>
                            {fields
                              .filter((f) => f.type === "text" && f.name)
                              .map((f) => (
                                <option key={f.name} value={f.name}>
                                  {f.label || f.name}
                                </option>
                              ))}
                          </select>
                        </div>
                      )}

                      <div>
                        <label className='block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5'>
                          Description (optional)
                        </label>
                        <input
                          {...register(`fields.${index}.description` as const)}
                          className='w-full px-3 py-2 text-sm border border-gray-300 rounded-md text-gray-900'
                          placeholder='Help text for this field'
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

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
    </div>
  );
}
