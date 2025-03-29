
import { useFetchCustomers } from "./api/fetchCustomers";
import { useDeleteCustomers } from "./api/deleteCustomers";
import { useCustomerBookingHistory } from "./api/customerBookingHistory";
import { useFindCustomer } from "./api/findCustomer";

export const useCustomerAPI = () => {
  const { fetchCustomers } = useFetchCustomers();
  const { deleteAllCustomers } = useDeleteCustomers();
  const { getBookingHistoryForCustomer } = useCustomerBookingHistory();
  const { findCustomerByEmailOrPhone } = useFindCustomer();

  return {
    fetchCustomers,
    deleteAllCustomers,
    getBookingHistoryForCustomer,
    findCustomerByEmailOrPhone
  };
};
