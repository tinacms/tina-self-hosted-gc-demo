import { LocalAuthProvider, defineConfig } from "tinacms";
import {
  DefaultAuthJSProvider,
} from "tinacms-authjs/dist/tinacms";

const isLocal = process.env.TINA_PUBLIC_IS_LOCAL === "true";

// @ts-ignore
const config = defineConfig({
  contentApiUrlOverride: "/api/tina/gql", // ensure this value is provided depending on your hosting solution
  authProvider: isLocal
    ? new LocalAuthProvider()
    : new DefaultAuthJSProvider(),
  build: {
    outputFolder: "admin",
    publicFolder: "_site",
  },
  media: {
    tina: {
      mediaRoot: "",
      publicFolder: "public",
      static: true,
    },
  },
  schema: {
    collections: [
      {
        ui: {
          global: true,
          allowedActions: {
            create: false,
            delete: false,
          },
        },
        isAuthCollection: true,
        isDetached: true,
        label: 'Users',
        name: 'user',
        path: 'content/users',
        format: 'json',
        fields: [
          {
            type: 'object',
            name: 'users',
            list: true,
            ui: {
              defaultItem: {
                username: 'new-user',
                name: 'New User',
                password: undefined,
              },
              itemProps: (item) => ({ label: item?.username }),
            },
            fields: [
              {
                type: 'string',
                label: 'Username',
                name: 'username',
                uid: true,
                required: true,
              },
              {
                type: 'string',
                label: 'Name',
                name: 'name',
              },
              {
                type: 'string',
                label: 'Email',
                name: 'email',
              },
            ],
          },
        ],
      },
      {
        name: "pages",
        label: "Pages",
        path: "site",
        ui: {
          // @ts-ignore
          defaultItem: {
            layout: "layout",
          },
        },
        fields: [
          {
            type: "string",
            name: "title",
            label: "Title",
            isTitle: true,
            required: true,
          },
          {
            type: "string",
            name: "layout",
            label: "Layout",
            options: [
              "layout",
              // add more layouts here
            ],
          },
          {
            type: "rich-text",
            name: "body",
            label: "Body",
            isBody: true,
          },
        ],
      },
    ],
  },
});

export default config;
