import Typography from "@/components/typography"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"

export default function CardSection() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Card title</CardTitle>
            <CardDescription>Short card description</CardDescription>
          </CardHeader>
          <CardContent>
            <Typography variant="small">
              Card main content goes here.
            </Typography>
          </CardContent>
          <CardFooter>
            <Button variant="ghost">Action</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
