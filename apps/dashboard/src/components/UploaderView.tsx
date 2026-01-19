import { useState } from "react";
import { gql } from "@apollo/client";
import { useQuery, useMutation } from "@apollo/client/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { UploadButton } from "./UploadButton.tsx";

interface PDF {
  id: string;
  filename: string;
  secure_url: string;
}

interface Collection {
  id: string;
  name: string;
  pdfs: PDF[];
}

interface MyCollectionsData {
  myCollections: Collection[];
}

const GET_COLLECTIONS = gql`
  query MyCollections($uploaderId: String!) {
    myCollections(uploaderId: $uploaderId) {
      id
      name
      pdfs {
        id
        filename
        secure_url
      }
    }
  }
`;

const CREATE_COLLECTION = gql`
  mutation CreateCollection(
    $name: String!
    $uploaderId: String!
    $tenantId: String!
  ) {
    createCollection(
      name: $name
      uploaderId: $uploaderId
      tenantId: $tenantId
    ) {
      id
      name
    }
  }
`;

const DELETE_COLLECTION = gql`
  mutation DeleteCollection($id: ID!) {
    deleteCollection(id: $id) {
      id
    }
  }
`;

const DELETE_PDF = gql`
  mutation DeletePdf($id: ID!) {
    deletePdf(id: $id) {
      id
    }
  }
`;

const TEST_UPLOADER_ID = "6f5d7e14-99ad-4a1b-b1d6-f660e1fb2704";
const TEST_TENANT_ID = "org_123";

export function UploaderView() {
  const [selectedCollection, setSelectedCollection] =
    useState<Collection | null>(null);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const { data, loading, refetch } = useQuery<MyCollectionsData>(
    GET_COLLECTIONS,
    {
      variables: { uploaderId: TEST_UPLOADER_ID },
      skip: !TEST_UPLOADER_ID,
    },
  );

  const [createCollection] = useMutation(CREATE_COLLECTION, {
    onCompleted: () => {
      setIsOpen(false);
      setNewCollectionName("");
      refetch();
    },
  });

  const [deleteCollection] = useMutation(DELETE_COLLECTION, {
    onCompleted: () => {
      setSelectedCollection(null);
      refetch();
    },
  });

  const [deletePdf] = useMutation(DELETE_PDF, {
    onCompleted: () => refetch(),
  });

  const handleCreate = () => {
    if (!newCollectionName.trim()) return;
    createCollection({
      variables: {
        name: newCollectionName,
        uploaderId: TEST_UPLOADER_ID,
        tenantId: TEST_TENANT_ID,
      },
    });
  };

  const handleDeleteCollection = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("Are you sure? This will delete all PDFs inside.")) {
      deleteCollection({ variables: { id } });
    }
  };

  const handleDeletePdf = (id: string) => {
    if (confirm("Delete this PDF?")) {
      deletePdf({ variables: { id } });
    }
  };

  if (loading) return <div className="p-10">Loading collections...</div>;

  if (selectedCollection) {
    const activeData = data?.myCollections.find(
      (c) => c.id === selectedCollection.id,
    );
    if (!activeData) return <div>Collection not found.</div>;

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => setSelectedCollection(null)}>
            ← Back
          </Button>
          <h2 className="text-xl font-bold text-text-primary">
            📂 {activeData.name}
          </h2>
        </div>

        <div className="card p-6 min-h-[300px]">
          <div className="flex justify-between items-center mb-6 border-b border-border-secondary pb-4">
            <h3 className="text-lg font-medium">Documents</h3>
            <UploadButton
              collectionId={activeData.id}
              onUploadComplete={() => refetch()}
            />
          </div>

          <div className="space-y-2">
            {activeData.pdfs.map((pdf) => (
              <div
                key={pdf.id}
                className="flex justify-between items-center p-3 bg-bg-secondary rounded hover:bg-bg-hover transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-red-500 text-xl">📄</span>
                  <a
                    href={pdf.secure_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-text-primary hover:underline"
                  >
                    {pdf.filename}
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-text-secondary bg-bg-tertiary px-2 py-1 rounded">
                    Pending Approval
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-text-secondary hover:text-red-500 hover:bg-red-50 p-1 h-8 w-8"
                    onClick={() => handleDeletePdf(pdf.id)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            ))}
            {activeData.pdfs.length === 0 && (
              <p className="text-text-secondary text-center py-10">
                This folder is empty.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-text-primary">My Collections</h2>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="btn-primary text-white hover:opacity-90">
              + New Collection
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-bg-primary">
            <DialogHeader>
              <DialogTitle>Create New Collection</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Input
                placeholder="Collection Name"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
              />
              <Button
                onClick={handleCreate}
                className="w-full bg-primary text-white"
              >
                Create
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {data?.myCollections?.map((col) => (
          <div
            key={col.id}
            onClick={() => setSelectedCollection(col)}
            className="card p-4 hover:border-primary cursor-pointer transition-all group hover:shadow-md relative"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-text-primary group-hover:text-primary">
                  {col.name}
                </h3>
                <p className="text-sm text-text-secondary mt-1">
                  {col.pdfs.length} PDFs
                </p>
              </div>
              <span className="text-2xl">📂</span>
            </div>

            <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
                onClick={(e) => handleDeleteCollection(e, col.id)}
              >
                <Trash2 size={16} />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
