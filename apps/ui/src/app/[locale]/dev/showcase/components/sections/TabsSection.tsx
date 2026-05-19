import Typography from "@/components/typography"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function TabsSection() {
  return (
    <div className="flex flex-col gap-6">
      <Tabs defaultValue="tab-1">
        <TabsList>
          <TabsTrigger value="tab-1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab-2">Tab 2</TabsTrigger>
        </TabsList>

        <TabsContent value="tab-1">
          <Typography variant="small">Content for tab 1</Typography>
        </TabsContent>
        <TabsContent value="tab-2">
          <Typography variant="small">Content for tab 2</Typography>
        </TabsContent>
      </Tabs>
    </div>
  )
}
