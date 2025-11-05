import React, { useEffect, useState } from "react";
import { handleError } from "../../utils/helpers";
import { api } from "../../lib/services";

const useGetAllCategories = (status, page, limit) => {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({
    totalCategories: 0,
    totalActiveCategories: 0,
    totalInactiveCategories: 0,
  });
  const [totalPages, setTotalPages] = useState(1);
  const [totalData, setTotalData] = useState(0);

  const getAllCategories = async () => {
    setLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // const response = await api.getAllCategories(status, page, limit);
      const response = {
        success: true,
        message: "Categories retrieved successfully",
        data: {
          categories: [
            {
              _id: "68beb759ff1a70cc27e566b9",
              name: "Shirt",
              isActive: true,
              isDeleted: false,
              createdAt: "2025-09-08T11:00:41.153Z",
              updatedAt: "2025-09-08T11:00:41.153Z",
              __v: 0,
            },
            {
              _id: "68be9d2588b3ea9729f8ac1e",
              name: "Toys",
              isActive: true,
              isDeleted: false,
              createdAt: "2025-09-08T09:08:53.188Z",
              updatedAt: "2025-09-08T09:08:53.188Z",
              __v: 0,
            },
            {
              _id: "68b7f409bd937a56c8b3a610",
              name: "Pants",
              isActive: true,
              isDeleted: false,
              createdAt: "2025-09-03T07:53:45.803Z",
              updatedAt: "2025-09-03T07:53:45.803Z",
              __v: 0,
            },
            {
              _id: "68b7efdee3f3c7567effea54",
              name: "Bottoms",
              isActive: true,
              isDeleted: false,
              createdAt: "2025-09-03T07:35:58.464Z",
              updatedAt: "2025-09-03T07:48:29.725Z",
              __v: 0,
            },
            {
              _id: "68a421a6b27e9427529421f3",
              name: "Dress",
              isActive: true,
              isDeleted: false,
              createdAt: "2025-08-19T07:03:02.272Z",
              updatedAt: "2025-09-03T13:33:38.726Z",
              __v: 0,
            },
            {
              _id: "68a4217eb27e9427529421ef",
              name: "Shoes",
              isActive: true,
              isDeleted: false,
              createdAt: "2025-08-19T07:02:22.380Z",
              updatedAt: "2025-09-05T15:30:16.136Z",
              __v: 0,
            },
            {
              _id: "68a42146b27e9427529421e5",
              name: "Tops",
              isActive: true,
              isDeleted: false,
              createdAt: "2025-08-19T07:01:26.472Z",
              updatedAt: "2025-08-19T07:01:26.472Z",
              __v: 0,
            },
          ],
          stats: {
            _id: null,
            totalCategories: 7,
            totalActiveCategories: 7,
            totalInactiveCategories: 0,
          },
        },
        pagination: {
          itemsPerPage: 200,
          currentPage: 1,
          totalItems: 7,
          totalPages: 1,
        },
      };
      setCategories(response.data.categories);
      setStats(response.data.stats);
      setTotalPages(response.pagination.totalPages);
      setTotalData(response.pagination.totalItems);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllCategories();
  }, [status, page, limit]);

  return {
    loading,
    categories,
    totalPages,
    totalData,
    stats,
    getAllCategories,
  };
};

export default useGetAllCategories;
