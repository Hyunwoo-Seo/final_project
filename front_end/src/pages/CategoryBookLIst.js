import React from "react";
import CategoryBanner from "../components/CategoryBanner";
import ProductList from "../components/ProductList";
import styled from "styled-components";
import Header from "../components/Header";
import Footer from "../components/Footer";
import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { serverURL } from "../config";

// ============== Style component ============== //
const PurchaseRequestContainer = styled.div`
  display: flex;
  justify-content: left;
  align-items: center;
  /* width: 1251px; */
  width: 100%;
  height: 115px;
  /* margin: auto; */
  padding-left: 20px;
`;

const PurchaseRequest = styled.div`
  display: flex;
  justify-content: left;
  align-items: center;
  padding: 0 6vw 0 0; // 카테고리 링크를 가려서 padding 크기 수정.
  margin: 0;
  @media (max-width: 425px) {
    margin-bottom: 3rem;
  }
`;

const Title = styled.h3`
  font-size: 22px;
  margin-right: 4rem;

  @media (max-width: 425px) {
    font-size: 17px;
    margin-right: 1rem;
  }
`;

const Button = styled.a`
  background-color: #c87e66;
  color: white;
  width: 156px;
  height: 46px;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9375rem;
  text-decoration: none;

  @media (max-width: 425px) {
    font-size: 0.75rem;
    width: 130px;
    height: 40px;
  }
`;
// ============== Style component ============== //


const CategoryBookList = () => {
  const [bookList, setBookList] = useState([]);
  const { category, search } = useParams();  //URL에서 파라미터 가져오기 위함

const getBuyBookList = async () => {
  try {
    let response;
    if (category!=='all') {
      // 특정 카테고리가 있는 경우
      response = await axios.get(
        `${serverURL}/buyerbook/category/${category}`
      );
    } else {
      // 카테고리가 모든 도서인 경우 (all)
      response = await axios.get(`${serverURL}/buyerbook`);
    }
    const data = response.data;
    const updatedBookList = await getUserNicknames(data);
    //console.log(updatedBookList, 'updatedBookList')

    // URL에서 검색어 가져오기
    const queryString = window.location.search;
    console.log(queryString, "queryString")
    const urlParams = new URLSearchParams(queryString);
    const searchQuery = urlParams.get('q');
    console.log("검색어:", searchQuery);

    // 검색어가 존재하면 필터링을 적용하여 업데이트된 도서 목록 설정
    if (searchQuery) {
      const filteredBooks = updatedBookList.filter(book => 
        book.author.includes(searchQuery) || book.itemTitle.includes(searchQuery)
      );
      setBookList(filteredBooks);
    } else {
      // 검색어가 없으면 그대로 도서 목록 설정
      setBookList(updatedBookList);
    }
  } catch (error) {
    console.error("구매희망 책 리스트를 가져올수 없습니다.", error);
  }
};



  const getUserNicknames = async (data) => {
    try {
      const custKeys = data.map((user) => user.custKey);
      const responses = await Promise.all(
        custKeys.map((custKey) =>
          axios.get(`${serverURL}/customers/${custKey}`)
        )
      );
      const nickNames = responses.map((response) => response.data.nickname);
      const updatedBookList = data.map((user, index) => ({
        ...user,
        nickname: nickNames[index],
      }));
      return updatedBookList;
    } catch (error) {
      console.error("사용자의 닉네임을 가져올 수 없습니다.", error);
      return [];
    }
  };

  useEffect(() => {
    getBuyBookList();
  }, [category, search]);

  useEffect(() => {
    const handlePopState = () => {
      getBuyBookList();
    };
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  return (
    <>

      <div className="height-container">

      <Header />
      <div className="yhw_container">
        <PurchaseRequestContainer>
          <PurchaseRequest>
            <Title>구매 희망 상품 등록</Title>
            <Button href="/Mypage/RegRequest">상품 등록 요청</Button>
          </PurchaseRequest>
        </PurchaseRequestContainer>
        <CategoryBanner category={category} />
        {bookList.map((book, index) => (
          <ProductList key={index} bookList={book} />
        ))}

      </div>

    </div>
      <Footer />
    </>
  );
};

export default CategoryBookList;
