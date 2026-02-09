export const seoPopulate = {
  populate: {
    metaImage: true,
    twitter: { populate: { images: true } },
    og: { populate: { image: true } },
  },
} as const
