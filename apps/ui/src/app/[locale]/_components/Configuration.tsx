import Strapi from "@/lib/strapi"

async function getData() {
  try {
    const configuration = await Strapi.fetchOne(
      "api::configuration.configuration",
      undefined,
      { populate: "*" }
    )

    return configuration.data
  } catch (e) {
    console.error(
      "Configuration wasn't fetched. Check Strapi data and permissions.",
      e
    )
    return undefined
  }
}

export async function ConfigurationExample() {
  const configuration = await getData()

  if (!configuration) {
    return null
  }

  const { darkMode } = configuration.attributes

  return (
    <div className="p-3">
      <h4>
        <strong>Configuration fetched from API</strong>
      </h4>
      <p>Dark mode (boolean): {String(darkMode)}</p>
    </div>
  )
}
