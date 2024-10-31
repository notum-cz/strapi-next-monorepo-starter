import Strapi from "@/lib/strapi"

async function getData() {
  return Strapi.fetchOne("api::configuration.configuration", undefined, {
    populate: { example: true },
  })
}

export async function ConfigurationExample() {
  const response = await getData()

  if (!response.data) {
    return null
  }

  const { darkMode, example } = response.data

  return (
    <div className="m-auto w-[800px] rounded-md border bg-gray-100">
      <div className="p-3">
        <h4>
          <strong>Configuration fetched from API</strong>
        </h4>
        <p>Dark mode (boolean): {String(darkMode)}</p>
        <p>Author: {example?.author ?? "not set"}</p>
      </div>
    </div>
  )
}
