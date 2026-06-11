import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import OperationBoard from "@/pages/OperationBoard";
import Quote from "@/pages/Quote";
import Orders from "@/pages/Orders";
import NewOrder from "@/pages/NewOrder";
import Standards from "@/pages/Standards";
import DamageClaims from "@/pages/DamageClaims";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="operation-board" element={<OperationBoard />} />
          <Route path="quote" element={<Quote />} />
          <Route path="orders" element={<Orders />} />
          <Route path="orders/new" element={<NewOrder />} />
          <Route path="damage-claims" element={<DamageClaims />} />
          <Route path="standards" element={<Standards />} />
        </Route>
      </Routes>
    </Router>
  );
}
