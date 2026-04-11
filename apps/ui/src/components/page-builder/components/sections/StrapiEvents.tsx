import type { Data } from "@repo/strapi-types"
import { Calendar, Clock, MapPin, Tag } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/styles"

interface StrapiEventsProps {
  readonly component: Data.Component<"sections.events">
}

function formatDate(dateString: string | Date) {
  const date = new Date(dateString)

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

function formatTime(timeString: string) {
  if (!timeString) return ""
  const [hours, minutes] = timeString.split(":")
  const date = new Date()
  date.setHours(Number.parseInt(hours || "0", 10))
  date.setMinutes(Number.parseInt(minutes || "0", 10))

  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function StrapiEvents({ component }: StrapiEventsProps) {
  const {
    title,
    subtitle,
    events,
    layout = "grid",
    columns = 3,
    showFilters = true,
    bgColor,
  } = component

  if (!events || events.length === 0) {
    return null
  }

  const getGridColumns = () => {
    switch (columns) {
      case 1:
        return "grid-cols-1"
      case 2:
        return "grid-cols-1 md:grid-cols-2"
      case 3:
        return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
      case 4:
        return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"

      default:
        return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
    }
  }

  return (
    <section
      className={cn(
        "py-12",
        bgColor && bgColor !== "null" ? `bg-[${bgColor}]` : ""
      )}
      style={{
        backgroundColor: bgColor && bgColor !== "null" ? bgColor : undefined,
      }}
    >
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {title}
          </h2>
          {subtitle && (
            <p className="text-muted-foreground mt-4 text-xl">{subtitle}</p>
          )}
        </div>

        {showFilters && (
          <div className="mb-8 flex flex-wrap justify-center gap-4">
            <Button variant="outline" size="sm">
              All Events
            </Button>
            <Button variant="outline" size="sm">
              Upcoming
            </Button>
            <Button variant="outline" size="sm">
              Past
            </Button>
          </div>
        )}

        <div
          className={`grid gap-8 ${layout === "grid" ? getGridColumns() : "space-y-8"}`}
        >
          {events.map((event, index) => (
            <Card
              key={index}
              className="overflow-hidden transition-shadow duration-300 hover:shadow-lg"
            >
              {event.image && event.image.media && event.image.media.url && (
                <div className="aspect-video overflow-hidden">
                  <img
                    src={event.image.media.url}
                    alt={event.image.alt || event.title}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}

              <CardHeader className="space-y-2">
                <div className="text-muted-foreground flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4" />
                  <span>{event.date ? formatDate(event.date) : ""}</span>
                  {event.time && (
                    <>
                      <Clock className="h-4 w-4" />
                      <span>{formatTime(event.time)}</span>
                    </>
                  )}
                </div>

                <CardTitle className="text-2xl">{event.title}</CardTitle>

                {event.location && (
                  <div className="text-muted-foreground flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4" />
                    <span>{event.location}</span>
                  </div>
                )}

                {event.tags && event.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {event.tags.map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="bg-secondary text-secondary-foreground inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs"
                      >
                        <Tag className="h-3 w-3" />
                        {tag.text}
                      </span>
                    ))}
                  </div>
                )}
              </CardHeader>

              <CardContent>
                {event.description && (
                  <CardDescription className="prose prose-sm max-w-none">
                    {event.description}
                  </CardDescription>
                )}

                {event.ctaLink && event.ctaLink.href && (
                  <div className="mt-6">
                    <Button asChild variant="outline">
                      <a
                        href={event.ctaLink.href}
                        target={event.ctaLink.newTab ? "_blank" : "_self"}
                        rel="noreferrer"
                      >
                        {event.ctaLink.label || "Learn More"}
                      </a>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
