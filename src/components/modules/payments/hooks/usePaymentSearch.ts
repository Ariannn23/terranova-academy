import { useState, useEffect } from "react";
import { searchStudentsForPayment, SearchStudentResult } from "@/lib/actions/payment.actions";
import { toast } from "sonner";

export function usePaymentSearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<SearchStudentResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<SearchStudentResult | null>(null);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.length >= 2) {
        setIsSearching(true);
        const res = await searchStudentsForPayment(searchTerm);
        if (res.success) {
          setSearchResults(res.data || []);
        } else {
          toast.error(res.error);
        }
        setIsSearching(false);
      } else {
        setSearchResults([]);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const clearSearch = () => {
    setSearchTerm("");
    setSearchResults([]);
  };

  return {
    searchTerm,
    setSearchTerm,
    searchResults,
    isSearching,
    selectedStudent,
    setSelectedStudent,
    clearSearch,
  };
}
