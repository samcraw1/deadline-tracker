import { CSVImport } from "@/components/clients/csv-import";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function ClientImportPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/clients">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Import Clients</h1>
          <p className="text-muted-foreground">
            Upload a CSV file to bulk-import clients and auto-generate their deadlines.
          </p>
        </div>
      </div>

      <CSVImport />
    </div>
  );
}
