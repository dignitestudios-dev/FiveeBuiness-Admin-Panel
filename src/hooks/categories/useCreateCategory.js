import { useState } from "react";
import { handleError } from "../../utils/helpers";
import { api } from "../../lib/services";

const useCreateCategory = () => {
  const [loading, setLoading] = useState(false);

  const createCategory = async (categoryData) => {
    setLoading(true);
    try {
      // const response = await api.createCategory(categoryData);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const response = {
        success: true,
      };
      setLoading(false);
      return response.success;
    } catch (error) {
      handleError(error);
      setLoading(false);
      return false;
    }
  };

  return { loading, createCategory };
};

export default useCreateCategory;
