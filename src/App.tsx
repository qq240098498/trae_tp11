import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import Quote from "@/pages/Quote";
import Orders from "@/pages/Orders";
import NewOrder from "@/pages/NewOrder";
import Standards from "@/pages/Standards";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="quote" element={<Quote />} />
          <Route path="orders" element={<Orders />} />
          <Route path="orders/new" element={<NewOrder />} />
          <Route path="standards" element={<Standards />} />
        </Route>
      </Routes>
    </Router>
  );
}
