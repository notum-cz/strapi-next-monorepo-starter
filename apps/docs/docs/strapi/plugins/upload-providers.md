---
sidebar_position: 7
---

# Upload Providers

Upload provider configuration lives in `apps/strapi/config/plugins/upload.ts`.

See the Strapi [Media Library](https://docs.strapi.io/cms/features/media-library) docs for the upstream media feature.

:::tip
Local storage is usually only for local development. In hosted environments, use S3 or another external store because many platforms do not provide persistent container filesystem storage, for example Heroku dynos. External storage is also useful when media should be served through a DAM, CDN, or dedicated asset pipeline.
:::

Provider resolution priority is:

1. Azure Blob Storage
2. AWS S3
3. Local upload provider

The first provider whose required environment variables are present wins.

## Azure Blob Storage

Provider: [`strapi-provider-upload-azure-storage`](https://www.npmjs.com/package/strapi-provider-upload-azure-storage). See also [Azure Blob Storage](https://learn.microsoft.com/en-us/azure/storage/blobs/storage-blobs-overview).

Required environment variables:

| Var                                                  | Purpose                                                                                              |
| ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `STORAGE_ACCOUNT`                                    | Azure storage account name.                                                                          |
| `STORAGE_CONTAINER_NAME`                             | Container name.                                                                                      |
| `STORAGE_ACCOUNT_KEY` or `STORAGE_ACCOUNT_SAS_TOKEN` | Credentials when `STORAGE_AUTH_TYPE=default`.                                                        |
| `STORAGE_AUTH_TYPE=msi`                              | Managed Identity mode. Assign the Storage Blob Data Contributor RBAC role instead of providing keys. |

Configure Blob service CORS to allow `GET`, `HEAD`, and `OPTIONS` from the Strapi admin origin. Without this, media appears in the gallery but fails in the admin modal.

The Azure Blob domain (`*.blob.core.windows.net`) is whitelisted in `apps/strapi/config/middlewares.ts`. Add custom `STORAGE_URL` or `STORAGE_CDN_URL` domains there if you use them.

## AWS S3

Provider: [`@strapi/provider-upload-aws-s3`](https://www.npmjs.com/package/@strapi/provider-upload-aws-s3). See also the Strapi [AWS S3 upload provider](https://docs.strapi.io/cms/providers#aws-s3) docs and [Amazon S3](https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html).

Required environment variables:

| Var                 | Purpose            |
| ------------------- | ------------------ |
| `AWS_ACCESS_KEY_ID` | Access key.        |
| `AWS_ACCESS_SECRET` | Secret access key. |
| `AWS_REGION`        | Bucket region.     |
| `AWS_BUCKET`        | Bucket name.       |

`*.amazonaws.com` is whitelisted in `apps/strapi/config/middlewares.ts`. Add a `CDN_URL` host if you use a CDN.
