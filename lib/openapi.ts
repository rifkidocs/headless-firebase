import { CollectionConfig, Field } from "./types";

export function generateOpenApiSpec(collections: CollectionConfig[]) {
  const spec: any = {
    openapi: "3.0.0",
    info: {
      title: "Headless Firebase API",
      version: "1.0.0",
      description: "Automated API documentation for your headless CMS",
    },
    paths: {},
    components: {
      schemas: {},
    },
  };

  collections.forEach((col) => {
    const schemaName = col.label.replace(/\s+/g, "");
    spec.components.schemas[schemaName] = generateSchema(col);

    // List & Create
    spec.paths[`/api/${col.slug}`] = {
      get: {
        summary: `Find all ${col.label}`,
        tags: [col.label],
        responses: {
          200: {
            description: "Success",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: `#/components/schemas/${schemaName}` },
                },
              },
            },
          },
        },
      },
      post: {
        summary: `Create a ${col.label}`,
        tags: [col.label],
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: `#/components/schemas/${schemaName}` },
            },
          },
        },
        responses: {
          201: {
            description: "Created",
          },
        },
      },
    };

    // Single Resource
    spec.paths[`/api/${col.slug}/{id}`] = {
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
      ],
      get: {
        summary: `Get a single ${col.label}`,
        tags: [col.label],
        responses: {
          200: {
            description: "Success",
            content: {
              "application/json": {
                schema: { $ref: `#/components/schemas/${schemaName}` },
              },
            },
          },
        },
      },
      patch: {
        summary: `Update a ${col.label}`,
        tags: [col.label],
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: `#/components/schemas/${schemaName}` },
            },
          },
        },
        responses: {
          200: {
            description: "Updated",
          },
        },
      },
      delete: {
        summary: `Delete a ${col.label}`,
        tags: [col.label],
        responses: {
          200: {
            description: "Deleted",
          },
        },
      },
    };
  });

  return spec;
}

function generateSchema(col: CollectionConfig) {
  const properties: any = {
    id: { type: "string" },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
  };

  const required: string[] = [];

  col.fields.forEach((field) => {
    properties[field.name] = mapFieldToSchema(field);
    if (field.required) {
      required.push(field.name);
    }
  });

  return {
    type: "object",
    properties,
    required: required.length > 0 ? required : undefined,
  };
}

function mapFieldToSchema(field: Field): any {
  switch (field.type) {
    case "number":
      return { type: "integer" };
    case "decimal":
      return { type: "number" };
    case "boolean":
      return { type: "boolean" };
    case "date":
      return { type: "string", format: "date" };
    case "datetime":
      return { type: "string", format: "date-time" };
    case "json":
      return { type: "object" };
    case "enumeration":
      return {
        type: "string",
        enum: field.enumOptions?.map((o) => o.value) || [],
      };
    case "media":
      return {
        type: "object",
        properties: {
          url: { type: "string" },
          id: { type: "string" },
        },
      };
    default:
      return { type: "string" };
  }
}
