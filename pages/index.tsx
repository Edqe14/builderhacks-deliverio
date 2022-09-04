import Layout from '@/components/Layout';
import Tabs from '@/components/Tabs/Tabs';

const Home = () => (
  <Layout>
    <div className="grid grid-cols-2 gap-4">
      <Tabs />
      <>maps</>
    </div>
  </Layout>
);

export default Home;
