import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { VscChevronRight } from "react-icons/vsc";
import { serverURL } from "../config";
import "../styled/BuyDetail.css";
import "../styled/DropDownSort.css";
import Header from "../components/Header";
import DetailTop from "../components/DetailTop";
import StateCategory from "../components/StateCategory";
import DetailConts from "../components/DetailConts";
import Footer from "../components/Footer";
import axios from "axios";

const BuyDetail = () => {
  const [selectedState, setSelectedState] = useState("최상"); // 초기 선택된 상태 설정
  const [filteredProducts, setFilteredProducts] = useState([]); // 필터링된 상품 정보 상태 ==> 초깃값으로는 아무것도 없는 빈 배열을 설정
  const { itemBuyKey } = useParams();
  const [bookInfo, setBookInfo] = useState([]);
  const [sellerInfo, setSellerInfo] = useState([]);
  const [buyerNickname, setBuyerNickname] = useState();
  const [selectedOption, setSelectedOption] = useState('priceAsc'); // 드롭다운 선택된 옵션

  // 특정 구매희망 도서 가져오기
  const getBookInfo = async () => {
    try {
      const response = await axios.get(
        `${serverURL}/buyerbook/item/${itemBuyKey}`
      );
      const bookData = response.data[0];

      // 구매자 정보 가져오기
      const buyerResponse = await axios.get(
        `${serverURL}/customers/${bookData.custKey}`
      );
      const buyerNickname = buyerResponse.data.nickname;
      // 구매자 닉네임을 bookData에 추가 (bookData = response.data[0];)
      bookData.buyerNickname = buyerNickname;

      setBookInfo(response.data[0]);
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };
  // 특정 도서 판매자 정보 가져오기
  const getSeller = async () => {
    try {
      const response = await axios.get(
        `${serverURL}/sellerbook/item/${itemBuyKey}`
      );
      // setSellerInfo(response.data);
      // /////// 판매자 등급 순 정렬을 위해 데이터 가져오기 ==> grade에 값이 잘 안 들어가는 문제로 인해 주석처리
      const sellerBookData = response.data;

      // 판매자 정보 데이터에 대한 추가 작업 수행
      const newData = await Promise.all(sellerBookData.map(async (seller) => {
        // 각 판매자의 custKey를 사용하여 해당 판매자의 추가 정보 가져오기
        const custResponse = await axios.get(`http://localhost:3001/customers/${seller.sellerKey}`);
        const customerData = custResponse.data;

        // seller 데이터에 grade 값을 추가
        const newSellerData = {
          ...seller,  // sellerbook 테이블에서 가져온 개별 판매자의 정보를 나타내는 객체
          grade: customerData.grade // customers 테이블에서 가져온 grade 값 추가
        };
        return newSellerData;
      }));

      setSellerInfo(newData);
    } catch (error) {
      console.error(error);
    }
  };

  // getBookInfo() 에서 구매자 닉네임 가져옴
  const getBuyerNickname = async () => {
    try {
      const response = await axios.get(
        `${serverURL}/customers/${bookInfo.custKey}`
      );

      setBuyerNickname(response.data.nickname);
    } catch (error) {
      console.error(error);
    }
  };

  // 초기 렌더링 시 최상 상태에 해당하는 상품 필터링
  useEffect(() => {
    getBookInfo();
    getSeller();
  }, []);

  useEffect(() => {
    // console.log(bookInfo.custKey, "bookinfo 데이터입니다.");
    // getBuyerNickname();
    handleStateChange("최상");
  }, [sellerInfo]);

  // StateCategory에서 선택된 상태를 처리하는 함수
  const handleStateChange = (state) => {
    setSelectedState(state); // 선택된 상태 업데이트
    filterProductsByState(state); // 선택된 상태에 따라 상품 필터링
  };

  // 선택된 상태에 따라 상품 필터링 함수
  const filterProductsByState = (selectedStt) => {
    let filtered;
    // 선택된 상태에 따라 상품 필터링
    if (selectedStt === "최상") {
      filtered = sellerInfo.filter((product) => product.damage === 0);
    } else if (selectedStt === "상") {
      filtered = sellerInfo.filter((product) => product.damage === 1);
    } else if (selectedStt === "중") {
      filtered = sellerInfo.filter((product) => product.damage >= 2);
    } else {
      console.log("상태 선택 오류");
    }
    setFilteredProducts(filtered); // 필터링된 상품 업데이트
    console.log(filtered, "필터된 데이터");
  };
  // 카테고리명에 따른 문자열 출력
  const getCategoryName = (category) => {
    switch (category) {
      case "economics":
        return "경제/경영";
      case "novels":
        return "소설/시/희곡";
      case "comics":
        return "만화";
      case "arts":
        return "예체능";
      case "science":
        return "과학";
      case "essays":
        return "에세이";
      default:
        return "-";
    }
  };

  // 드롭박스 옵션 이벤트 핸들러
  // const handleDropDownSelect = (option) => {
  const handleDropDownSelect = (e) => {
    setSelectedOption(e.target.value);
  };

  // 정렬된 상품 리스트
  const sortedProducts = selectedOption === "priceAsc" ? [...filteredProducts].sort((a, b) => a.price - b.price)
                          // : selectedOption === "priceDesc"  ? [...filteredProducts].sort((a, b) => b.price - a.price)
                          : selectedOption === "gradeAsc" ? [...filteredProducts].sort((a, b) => b.grade - a.grade)
                          : [...filteredProducts];

  return (
    <>
      <div className="height-container">
        <Header />

        <div className="yhw_container">
          <div className="yhw_detailCont">
            {" "}
            {/* Top부분 전체 감싸는 div */}
            <div className="yhw_detailTopBox">
              <div className="yhw_detailTopNav">
                {" "}
                {/* Top부분 - (절판서점>카테고리>책제목) 감싸는 div */}
                <Link to="/">
                  <span>절판서점</span>
                </Link>
                <span>
                  <VscChevronRight />
                </span>
                <Link to="/">
                  <span>{getCategoryName(bookInfo.category)}</span>
                </Link>
                <span>
                  <VscChevronRight />
                </span>
                <Link to="/">
                  <span>{bookInfo.itemTitle}</span>
                </Link>
              </div>
              <DetailTop bookInfo={bookInfo} />
              {/* bookInfo에 구매자 닉네임 정보 포함됨 */}
            </div>
            <br />
            <div className="yhw_deailStatCatBox">
              <StateCategory
                onStateChange={handleStateChange}
                filteredProducts={filteredProducts}
              />
            </div>
            <div className="yhw_detailMainBox">
              {/* <DropDownSort /> */}
              <div className="yhw_dropdownBox">
                <select
                  value={selectedOption}
                  onChange={handleDropDownSelect}
                  // onChange={(e) => handleSelect(e.target.value)}
                >
                  <option value="priceAsc">가격 낮은 순</option>
                  {/* <option value="priceDesc">가격 높은 순</option> */}
                  <option value="gradeAsc">판매자 등급 높은 순</option>
                </select>
              </div>
              {/* 필터링된 상품 정보를 기반으로 상품 내용을 화면에 표시 */}
              {/* 필터링된 상품 정보를 기반으로 정렬된 상품 내용을 화면에 표시 */}
              {sortedProducts.map((productInfo, index) => (
                <DetailConts
                  key={index}
                  productInfo={productInfo}
                  bookInfo={bookInfo}
                  sellerInfo={sellerInfo}
                />
              ))}
              {/* {filteredProducts.map((productInfo, index) => (
                <DetailConts
                  key={index}
                  productInfo={productInfo}
                  bookInfo={bookInfo}
                  sellerInfo={sellerInfo}
                />
              ))} */}
            </div>
          </div>{" "}
          {/* yhw_detailCont 끝 */}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default BuyDetail;
