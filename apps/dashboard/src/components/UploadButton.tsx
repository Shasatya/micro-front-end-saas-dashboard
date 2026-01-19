import { useState } from "react";
import { gql } from "@apollo/client";
import { useMutation } from "@apollo/client/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

interface GetSignatureData {
  getUploadSignature: {
    signature: string;
    timestamp: number;
    apiKey: string;
    cloudName: string;
  };
}

const GET_SIGNATURE = gql`
  mutation GetSignature {
    getUploadSignature {
      signature
      timestamp
      apiKey
      cloudName
    }
  }
`;

const SAVE_PDF = gql`
  mutation SavePdf(
    $filename: String!
    $cloudinaryId: String!
    $secureUrl: String!
    $collectionId: String!
  ) {
    savePdf(
      filename: $filename
      cloudinaryId: $cloudinaryId
      secureUrl: $secureUrl
      collectionId: $collectionId
    ) {
      id
      filename
    }
  }
`;

export function UploadButton({
  collectionId,
  onUploadComplete,
}: {
  collectionId: string;
  onUploadComplete: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [customName, setCustomName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [getSignature] = useMutation<GetSignatureData>(GET_SIGNATURE);
  const [savePdf] = useMutation(SAVE_PDF);

  const handleUpload = async () => {
    if (!selectedFile || !customName.trim()) return;

    setUploading(true);

    try {
      const { data: sigData } = await getSignature();
      if (!sigData) throw new Error("Failed to get signature");

      const { signature, timestamp, apiKey, cloudName } =
        sigData.getUploadSignature;

      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("api_key", apiKey);
      formData.append("timestamp", timestamp.toString());
      formData.append("signature", signature);
      formData.append("folder", "saas_pdfs");

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
        { method: "POST", body: formData },
      );

      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error?.message || "Upload failed");

      await savePdf({
        variables: {
          filename: customName,
          cloudinaryId: result.public_id,
          secureUrl: result.secure_url,
          collectionId: collectionId,
        },
      });

      setIsOpen(false);
      setCustomName("");
      setSelectedFile(null);
      onUploadComplete();
    } catch (err) {
      console.error(err);
      alert("Upload failed. Check console.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary text-white hover:bg-primary/90">
          + Add PDF
        </Button>
      </DialogTrigger>

      <DialogContent className="bg-bg-primary sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name" className="text-text-primary">
              Document Name
            </Label>
            <Input
              id="name"
              placeholder="e.g., Q1 Financial Report"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              className="col-span-3"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="file" className="text-text-primary">
              Select PDF
            </Label>
            <Input
              id="file"
              type="file"
              accept="application/pdf"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="cursor-pointer"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={handleUpload}
            disabled={uploading || !selectedFile || !customName}
            className="bg-primary text-white w-full"
          >
            {uploading ? "Uploading..." : "Upload Document"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
