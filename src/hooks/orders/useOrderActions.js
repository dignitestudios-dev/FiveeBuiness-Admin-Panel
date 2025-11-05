import { useEffect, useState } from "react";
import { handleError } from "../../utils/helpers";
import { api } from "../../lib/services";

const useOrderActions = (
  paymentStatus,
  orderStatus,
  orderType,
  startDate,
  endDate,
  search,
  page,
  limit
) => {
  const [loading, setLoading] = useState(false);
  const [loadingActions, setLoadingActions] = useState(false);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    processingOrders: 0,
    shippedOrders: 0,
    deliveredOrders: 0,
    totalRevenue: 0,
  });
  const [totalPages, setTotalPages] = useState(1);
  const [totalData, setTotalData] = useState(0);

  const getOrders = async () => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // const response = await api.getOrders(
      //   paymentStatus,
      //   orderStatus,
      //   orderType,
      //   startDate,
      //   endDate,
      //   search,
      //   page,
      //   limit
      // );

      const response = {
        success: true,
        message: "Orders retrieved successfully",
        data: {
          orders: [
            {
              _id: "68bf49ceff1a70cc27e5675b",
              contact: {
                email: "stacy.john@dignitestudios.com",
                _id: "68bf49ceff1a70cc27e5675c",
              },
              delivery: {
                firstName: "Stacy",
                lastName: "John",
                phoneNumber: "(689) 220-5530",
                country: "USA",
                city: "Orlando",
                address: "Lake Lynda",
                apartment: "",
                _id: "68bf49ceff1a70cc27e5675d",
              },
              products: [
                {
                  product: {
                    _id: "68be8ba62a222d25874b4f48",
                    title:
                      "Mattel Action Drivers Farm Adventure Tractor & 6 Accessories Matchbox Playset",
                  },
                  quantity: 1,
                  price: 18.74,
                  itemTotal: 18.74,
                  selectedColor: "default",
                  selectedSize: "normal",
                  _id: "68bf49ceff1a70cc27e5675e",
                },
              ],
              orderType: "delivery",
              shortCode: "HWL-513552",
              shippingCost: 61.68,
              totalAmount: 80.42,
              paymentIntentId: "pi_3S5CZ82EDMKASsMW0aFfo8wu",
              paymentMethodId: "pm_1S5CZ72EDMKASsMWYy4pYn6E",
              paymentStatus: "paid",
              orderStatus: "pending",
              createdAt: "2025-09-08T21:25:34.469Z",
              updatedAt: "2025-09-08T21:25:35.811Z",
              __v: 0,
            },
            {
              _id: "68be96f888b3ea9729f8abc7",
              contact: {
                email: "kevinparker.developer@gmail.com",
                _id: "68be96f888b3ea9729f8abc8",
              },
              delivery: null,
              products: [
                {
                  product: {
                    _id: "68be8495787a143b9bd23ead",
                    title: "Girls 7-16 2-pc Floral Dress & Purse Set",
                  },
                  quantity: 3,
                  price: 22.5,
                  itemTotal: 67.5,
                  selectedColor: "White",
                  selectedSize: "7-10",
                  _id: "68be96f888b3ea9729f8abc9",
                },
              ],
              orderType: "pickup",
              shortCode: "FWK-877415",
              shippingCost: 0,
              totalAmount: 67.5,
              paymentIntentId: "pi_3S50ej2EDMKASsMW0sxICtO0",
              paymentMethodId: "pm_1S50ei2EDMKASsMW7ClY18OA",
              paymentStatus: "paid",
              orderStatus: "pending",
              createdAt: "2025-09-08T08:42:32.939Z",
              updatedAt: "2025-09-08T08:42:34.565Z",
              __v: 0,
            },
            {
              _id: "68be95d288b3ea9729f8ab9b",
              contact: {
                email: "kevinparker.developer@gmail.com",
                _id: "68be95d288b3ea9729f8ab9c",
              },
              delivery: {
                firstName: "Kevin",
                lastName: "Parker",
                phoneNumber: "+1231232132",
                country: "US",
                city: "New York",
                address: "123 Main St, City, State",
                apartment: "",
                _id: "68be95d288b3ea9729f8ab9d",
              },
              products: [
                {
                  product: {
                    _id: "68be8495787a143b9bd23ead",
                    title: "Girls 7-16 2-pc Floral Dress & Purse Set",
                  },
                  quantity: 6,
                  price: 22.5,
                  itemTotal: 135,
                  selectedColor: "White",
                  selectedSize: "7-10",
                  _id: "68be95d288b3ea9729f8ab9e",
                },
                {
                  product: {
                    _id: "68be8495787a143b9bd23ead",
                    title: "Girls 7-16 2-pc Floral Dress & Purse Set",
                  },
                  quantity: 5,
                  price: 22.5,
                  itemTotal: 112.5,
                  selectedColor: "White",
                  selectedSize: "11-16",
                  _id: "68be95d288b3ea9729f8ab9f",
                },
              ],
              orderType: "delivery",
              shortCode: "WXL-768517",
              shippingCost: 5.1,
              totalAmount: 252.6,
              paymentIntentId: "pi_3S50Zz2EDMKASsMW1JaEzznn",
              paymentMethodId: "pm_1S50Zx2EDMKASsMWM5XbhG2M",
              paymentStatus: "paid",
              orderStatus: "pending",
              createdAt: "2025-09-08T08:37:38.561Z",
              updatedAt: "2025-09-08T08:37:40.540Z",
              __v: 0,
            },
          ],
          stats: {
            _id: null,
            totalOrders: 3,
            pendingOrders: 3,
            processingOrders: 0,
            shippedOrders: 0,
            deliveredOrders: 0,
            totalRevenue: 467.29999999999995,
          },
        },
        pagination: {
          itemsPerPage: 20,
          currentPage: 1,
          totalItems: 3,
          totalPages: 1,
        },
      };

      setOrders(response.data.orders);
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
    getOrders();
  }, [
    paymentStatus,
    orderStatus,
    orderType,
    startDate,
    endDate,
    search,
    page,
    limit,
  ]);

  const getOrdersByContact = async (contactEmail) => {
    setLoadingActions(true);
    try {
      return await api.getOrdersByContact(contactEmail);
    } catch (error) {
      handleError(error);
    } finally {
      setLoadingActions(false);
    }
  };

  const getOrderById = async (id) => {
    setLoadingActions(true);
    try {
      return await api.getOrderById(id);
    } catch (error) {
      handleError(error);
    } finally {
      setLoadingActions(false);
    }
  };

  const updateOrder = async (id, orderData) => {
    setLoadingActions(true);
    try {
      // const response = await api.updateOrder(id, orderData);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const response = {
        success: true,
      };
      setLoadingActions(false);
      return response.success;
    } catch (error) {
      handleError(error);
      setLoadingActions(false);
      return false;
    }
  };

  return {
    loading,
    loadingActions,
    orders,
    stats,
    totalPages,
    totalData,
    getOrders,
    getOrdersByContact,
    getOrderById,
    updateOrder,
  };
};

export default useOrderActions;
