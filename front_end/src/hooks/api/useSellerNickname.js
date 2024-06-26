import { useState, useEffect } from "react";
import { serverURL } from "../../config";
import axios from "axios";

const useSellerNickname = (custKey) => {
  const [sellerNickname, setSellerNickname] = useState("");

  useEffect(() => {
    const fetchSellerNickname = async () => {
      try {
        const response = await axios.get(
          `${serverURL}/customers/${custKey}`
        );
        setSellerNickname(response.data.nickname);
      } catch (error) {
        console.error("Error fetching seller nickname:", error);
      }
    };

    if (custKey) {
      fetchSellerNickname();
    }
  }, [custKey]);

  return sellerNickname;
};

export default useSellerNickname;
