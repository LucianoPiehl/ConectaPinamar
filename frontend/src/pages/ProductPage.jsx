import React from 'react';
import { useParams } from 'react-router-dom';
import ProductPageInner from './ProductPageInner';

export default function ProductPage(){
  const { id } = useParams();
  return <ProductPageInner id={id} />;
}
