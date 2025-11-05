import React, { useEffect, useState } from "react";
import { handleError } from "../../utils/helpers";
import { api } from "../../lib/services";

const useGetAllProducts = (search, status, page, limit) => {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalActiveProducts: 0,
    totalInactiveProducts: 0,
  });
  const [totalPages, setTotalPages] = useState(1);
  const [totalData, setTotalData] = useState(0);

  const getAllProducts = async () => {
    setLoading(true);

    try {
      // const response = await api.getAllProducts(search, status, page, limit);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const response = {
        success: true,
        message: "Products retrieved successfully",
        data: {
          products: [
            {
              _id: "68beb730ff1a70cc27e56692",
              title: "Baby & Toddler Boys Bluey And Bingo Button Front Tee",
              subtitle:
                "Your little one will love wearing this baby & toddler boys Bluey and Bingo button front tee.",
              description:
                "FEATURES:\r\nShort sleeves\r\nButton-front closure\r\nFront left chest pocket\r\n\r\nFABRIC & CARE:\r\nCotton\r\nMachine wash\r\nImported",
              stock: 800,
              colors: ["Default"],
              sizes: ["1-3", "4-7", "8-12"],
              price: 9.59,
              receivingOptions: ["delivery", "pickup"],
              images: [
                "https://skylaboo-bucket.s3.us-east-2.amazonaws.com/products/1757329200270-7231327.webp",
              ],
              category: {
                _id: "68beb759ff1a70cc27e566b9",
                name: "Shirt",
              },
              isFeatured: false,
              shippingCost: 1.25,
              isActive: false,
              isDeleted: false,
              createdAt: "2025-09-08T11:00:00.376Z",
              updatedAt: "2025-09-08T11:02:34.374Z",
              __v: 0,
            },
            {
              _id: "68be8ba62a222d25874b4f48",
              title:
                "Mattel Action Drivers Farm Adventure Tractor & 6 Accessories Matchbox Playset",
              subtitle:
                "Let your little one channel their imagination Farm Adventure Playset from Mattel.",
              description:
                'FEATURES:\r\nDrive the 1:64 scale tractor into the field to harvest the wheat, then attach the trailer accessory to haul the hay to the barn\r\nDetachable horse, goat and cow figures and 2 hay bales enhance the realism\r\nConnect this to other sets to create a world of kid-driven adventures and open-ended play\r\n\r\nWHAT\'S INCLUDED:\r\nIncludes 1 Tractor, Trailer, 2 Hay Bales, 1 Detachable Horse Figure, 1 Detachable Goat Figure and 1 Detachable Cow Figure\r\n\r\nDETAILS:\r\nAge: 3 years & up\r\n6.91"H x 13.75"W x 13.75"L\r\nProduct weight: 2.251 lbs.\r\n3 button cell batteries required (included)\r\nAssembly required\r\nFor 1 player\r\nPlastic\r\nSpot clean\r\nImported\r\nModel no. HRY41',
              stock: 230,
              colors: ["default"],
              sizes: ["normal"],
              price: 18.74,
              receivingOptions: ["delivery", "pickup"],
              images: [
                "https://skylaboo-bucket.s3.us-east-2.amazonaws.com/products/1757318052192-7101939_ALT.webp",
                "https://skylaboo-bucket.s3.us-east-2.amazonaws.com/products/1757318052320-7101939.webp",
              ],
              category: {
                _id: "68be9d2588b3ea9729f8ac1e",
                name: "Toys",
              },
              isFeatured: true,
              shippingCost: 1.68,
              isActive: true,
              isDeleted: false,
              createdAt: "2025-09-08T07:54:14.151Z",
              updatedAt: "2025-09-08T09:09:08.061Z",
              __v: 0,
            },
            {
              _id: "68be8495787a143b9bd23ead",
              title: "Girls 7-16 2-pc Floral Dress & Purse Set",
              subtitle:
                "Have her feeling great and looking great too with this girls 7-16 2-pc floral dress & purse set.",
              description:
                "FEATURES\r\n\r\nIncluded: dress and purse\r\nV-neck\r\nShort sleeves\r\nBelow the knee length\r\nFABRIC & CARE\r\n\r\nPolyester, spandex\r\nHand wash\r\nImported",
              stock: 900,
              colors: ["White"],
              sizes: ["7-10", "11-16"],
              price: 22.5,
              receivingOptions: ["delivery", "pickup"],
              images: [
                "https://skylaboo-bucket.s3.us-east-2.amazonaws.com/products/1757316241865-7551023_ALT4.webp",
                "https://skylaboo-bucket.s3.us-east-2.amazonaws.com/products/1757316241910-7551023_ALT3.webp",
                "https://skylaboo-bucket.s3.us-east-2.amazonaws.com/products/1757316241920-7551023_ALT2.webp",
                "https://skylaboo-bucket.s3.us-east-2.amazonaws.com/products/1757316241928-7551023_ALT.webp",
                "https://skylaboo-bucket.s3.us-east-2.amazonaws.com/products/1757316241937-7551023.webp",
              ],
              category: {
                _id: "68a42146b27e9427529421e5",
                name: "Tops",
              },
              isFeatured: true,
              shippingCost: 2.55,
              isActive: true,
              isDeleted: false,
              createdAt: "2025-09-08T07:24:05.684Z",
              updatedAt: "2025-09-08T07:45:00.095Z",
              __v: 0,
            },
          ],
          stats: {
            totalProducts: 3,
            totalActiveProducts: 2,
            totalInactiveProducts: 1,
          },
        },
        pagination: {
          itemsPerPage: 20,
          currentPage: 1,
          totalItems: 3,
          totalPages: 1,
        },
      };

      setProducts(response.data.products);
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
    getAllProducts();
  }, [page, limit, search, status]);

  return { loading, products, totalPages, totalData, stats, getAllProducts };
};

export default useGetAllProducts;
