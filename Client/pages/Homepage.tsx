import type { RouteContext } from '../components/Router';
import Header from '../components/Header';
import HeroSearch from '../components/HeroSearch';
import ProductCategories from '../components/ProductCategories';
import BestSellingProducts from '../components/BestSellingProducts';
import PlatformFeatures from '../components/PlatformFeatures';
import Footer from '../components/Footer';

export default function Homepage(context: RouteContext = {} as RouteContext) {
  return (
    <>
      <Header {...context} />
      <HeroSearch {...context} />
      <ProductCategories {...context} />
      <BestSellingProducts {...context} />
      <PlatformFeatures {...context} />
      <Footer {...context} />
    </>
  );
}