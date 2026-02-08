export default {
  populate: {
    images: {
      populate: { image: { populate: { media: true } }, link: true },
    },
  },
}
