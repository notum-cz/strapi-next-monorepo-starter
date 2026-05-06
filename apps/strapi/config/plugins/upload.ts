import type { EnvGetter } from "../../types/internals"

const localUploadConfig: Record<string, unknown> = {
  // Local provider setup
  // https://docs.strapi.io/dev-docs/plugins/upload
  sizeLimit: 250 * 1024 * 1024, // 250mb in bytes,
}

const prepareAzureStorageConfig = (env: EnvGetter) => {
  const storageAccount = env("STORAGE_ACCOUNT")
  const storageContainerName = env("STORAGE_CONTAINER_NAME")
  const authType = env("STORAGE_AUTH_TYPE", "default")
  const accountKey = env("STORAGE_ACCOUNT_KEY")
  const sasToken = env("STORAGE_ACCOUNT_SAS_TOKEN")

  const baseRequirementsOk = [storageAccount, storageContainerName].every(
    (req) => req != null && req !== ""
  )
  const credentialOk =
    authType === "msi" ||
    (accountKey != null && accountKey !== "") ||
    (sasToken != null && sasToken !== "")

  if (baseRequirementsOk && credentialOk) {
    return {
      provider: "strapi-provider-upload-azure-storage",
      providerOptions: {
        authType,
        account: storageAccount,
        accountKey,
        sasToken,
        containerName: storageContainerName,
        defaultPath: env("STORAGE_DEFAULT_PATH", "uploads"),
        serviceBaseURL: env("STORAGE_URL"),
        cdnBaseURL: env("STORAGE_CDN_URL"),
        defaultCacheControl: env("STORAGE_CACHE_CONTROL"),
        createContainerIfNotExist: env("STORAGE_CREATE_CONTAINER_IF_NOT_EXIST"),
        publicAccessType: env("STORAGE_PUBLIC_ACCESS_TYPE"),
        removeCN: env("REMOVE_CONTAINER_NAME"),
        clientId: env("STORAGE_AZURE_CLIENT_ID"),
      },
    }
  }
}

const prepareAwsS3Config = (env: EnvGetter) => {
  const awsAccessKeyId = env("AWS_ACCESS_KEY_ID")
  const awsAccessSecret = env("AWS_ACCESS_SECRET")
  const awsRegion = env("AWS_REGION")
  const awsBucket = env("AWS_BUCKET")
  const awsRequirements = [
    awsAccessKeyId,
    awsAccessSecret,
    awsRegion,
    awsBucket,
  ]
  const awsRequirementsOk = awsRequirements.every(
    (req) => req != null && req !== ""
  )

  if (awsRequirementsOk) {
    return {
      provider: "aws-s3",
      providerOptions: {
        baseUrl: env("CDN_URL"),
        rootPath: env("CDN_ROOT_PATH"),
        s3Options: {
          credentials: {
            accessKeyId: awsAccessKeyId,
            secretAccessKey: awsAccessSecret,
          },
          region: awsRegion,
          params: {
            ACL: env("AWS_ACL", "public-read"),
            signedUrlExpires: env("AWS_SIGNED_URL_EXPIRES", 15 * 60),
            Bucket: awsBucket,
          },
        },
      },
      actionOptions: {
        upload: {},
        uploadStream: {},
        delete: {},
      },
    }
  }
}

export function uploadConfig(env: EnvGetter) {
  const configs = {
    blob: prepareAzureStorageConfig(env),
    s3: prepareAwsS3Config(env),
  }

  if (configs.blob) {
    console.warn("Using Azure Storage for uploads.")
  }

  if (configs.s3) {
    console.warn("Using AWS S3 for uploads.")
  }

  if (!configs.blob && !configs.s3) {
    console.warn(
      "No cloud upload configuration is set. Falling back to local upload provider."
    )
  }

  return {
    config: configs.blob ?? configs.s3 ?? localUploadConfig,
  }
}
