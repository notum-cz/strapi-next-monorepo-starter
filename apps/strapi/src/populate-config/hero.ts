export default {
  populate: {
    links: true,
    image: { populate: { media: true } },
    steps: true,
  },
}
