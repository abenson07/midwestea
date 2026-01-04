"use client";

import { CreateClassModal } from "@/components/ui/CreateClassModal";

export default function ModalStylingPage() {
  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Modal Styling</h1>
        <p className="text-sm text-gray-500 mt-1">Style the CreateClassModal component</p>
      </div>
      
      <CreateClassModal />
    </div>
  );
}





