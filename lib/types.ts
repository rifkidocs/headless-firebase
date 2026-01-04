// Field Types for Schema Builder
export type FieldType =
    | "text"
    | "textarea"
    | "richtext"
    | "number"
    | "decimal"
    | "boolean"
    | "date"
    | "datetime"
    | "time"
    | "email"
    | "password"
    | "uid"
    | "json"
    | "enumeration"
    | "media"
    | "relation"
    | "component"
    | "dynamiczone";

export interface EnumerationOption {
    label: string;
    value: string;
}

export interface RelationConfig {
    type: "hasOne" | "hasMany" | "belongsTo" | "manyToMany";
    target: string; // Target collection slug
    displayField?: string; // Field to display in relation picker
}

export interface ComponentConfig {
    component: string; // Component ID
    repeatable: boolean;
    min?: number;
    max?: number;
}

export interface DynamicZoneConfig {
    components: string[]; // Array of component IDs
}

export interface Field {
    name: string;
    label: string;
    type: FieldType;
    required: boolean;
    unique?: boolean;
    private?: boolean; // Hidden from API response
    defaultValue?: unknown;
    placeholder?: string;
    description?: string;

    // Type-specific configs
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;

    // Enumeration
    enumOptions?: EnumerationOption[];

    // Relation
    relation?: RelationConfig;

    // Component
    component?: ComponentConfig;

    // Dynamic Zone
    dynamiczone?: DynamicZoneConfig;

    // UID
    targetField?: string; // Field to generate UID from
}

export interface CollectionConfig {
    slug: string;
    label: string;
    labelPlural?: string;
    kind: "collectionType" | "singleType";
    fields: Field[];
    icon?: string;
    description?: string;
    draftAndPublish?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface ComponentDefinition {
    id: string;
    name: string;
    displayName: string;
    category: string;
    icon?: string;
    description?: string;
    fields: Field[];
    createdAt?: Date;
    updatedAt?: Date;
}

export interface MediaItem {
    id: string;
    publicId: string;
    url: string;
    secureUrl: string;
    resourceType: "image" | "video" | "raw";
    format: string;
    bytes: number;
    width?: number;
    height?: number;
    duration?: number;
    folder: string;
    alt?: string;
    caption?: string;
    createdAt: Date;
    uploadedBy: string;
}

export interface Role {
    id: string;
    name: string;
    description: string;
    permissions: {
        [contentType: string]: {
            create: boolean;
            read: boolean;
            update: boolean;
            delete: boolean;
            publish: boolean;
        };
    };
    isDefault: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface UserProfile {
    id: string;
    uid: string; // Firebase Auth UID
    email: string;
    displayName: string;
    roleId: string;
    avatar?: string;
    isActive: boolean;
    createdAt: Date;
    lastLogin: Date;
}

// Field type metadata for UI
export const FIELD_TYPE_CONFIG: Record<FieldType, {
    label: string;
    description: string;
    icon: string;
    category: "text" | "number" | "date" | "boolean" | "media" | "advanced" | "relation";
}> = {
    text: {
        label: "Short Text",
        description: "Small or long text like title or description",
        icon: "Type",
        category: "text",
    },
    textarea: {
        label: "Long Text",
        description: "Multi-line text area",
        icon: "AlignLeft",
        category: "text",
    },
    richtext: {
        label: "Rich Text",
        description: "WYSIWYG text editor with formatting",
        icon: "FileText",
        category: "text",
    },
    number: {
        label: "Number",
        description: "Integer number",
        icon: "Hash",
        category: "number",
    },
    decimal: {
        label: "Decimal",
        description: "Floating point number",
        icon: "Percent",
        category: "number",
    },
    boolean: {
        label: "Boolean",
        description: "True or false toggle",
        icon: "ToggleLeft",
        category: "boolean",
    },
    date: {
        label: "Date",
        description: "Date picker (no time)",
        icon: "Calendar",
        category: "date",
    },
    datetime: {
        label: "DateTime",
        description: "Date and time picker",
        icon: "Clock",
        category: "date",
    },
    time: {
        label: "Time",
        description: "Time picker only",
        icon: "Clock3",
        category: "date",
    },
    email: {
        label: "Email",
        description: "Email field with validation",
        icon: "Mail",
        category: "text",
    },
    password: {
        label: "Password",
        description: "Hashed password field",
        icon: "Lock",
        category: "text",
    },
    uid: {
        label: "UID / Slug",
        description: "Auto-generated unique identifier",
        icon: "Fingerprint",
        category: "text",
    },
    json: {
        label: "JSON",
        description: "Raw JSON data",
        icon: "Braces",
        category: "advanced",
    },
    enumeration: {
        label: "Enumeration",
        description: "List of predefined values",
        icon: "List",
        category: "advanced",
    },
    media: {
        label: "Media",
        description: "Images, videos, or files",
        icon: "Image",
        category: "media",
    },
    relation: {
        label: "Relation",
        description: "Reference to other content",
        icon: "Link2",
        category: "relation",
    },
    component: {
        label: "Component",
        description: "Reusable group of fields",
        icon: "Component",
        category: "advanced",
    },
    dynamiczone: {
        label: "Dynamic Zone",
        description: "Flexible content area",
        icon: "Layers",
        category: "advanced",
    },
};

// Default roles
export const DEFAULT_ROLES: Omit<Role, "id" | "createdAt" | "updatedAt">[] = [
    {
        name: "Super Admin",
        description: "Full access to all features",
        permissions: {},
        isDefault: false,
    },
    {
        name: "Editor",
        description: "Can create, edit, and publish content",
        permissions: {},
        isDefault: false,
    },
    {
        name: "Author",
        description: "Can create and edit own content",
        permissions: {},
        isDefault: true,
    },
];
