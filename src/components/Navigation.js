import { ethers } from "ethers";

const Navigation = ({ account, setAccount }) => {
  const handleConnect = async () => {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    const account = ethers.utils.getAddress(accounts[0]);
    setAccount(account);
    console.log(account);
  };
  return (
    <nav className="nav">
      <div className="nav__brand">
        <h1>Dappazon</h1>
      </div>
      <input type="text" placeholder="" className="nav__search" />
      <button type="button" className="nav__connect" onClick={handleConnect}>
        {account
          ? account.slice(0, 6) + "..." + account.slice(38, 42)
          : "Connect"}
      </button>
      <ul className="nav__links">
        <li>
          <a href="#Clothing & Jewelry">Clothing & Jewelry</a>
        </li>
        <li>
          <a href="#Electronics & Gadgets">Electronics & Gadgets</a>
        </li>
        <li>
          <a href="#Toys & Gaming">Toys & Gaming</a>
        </li>
      </ul>
    </nav>
  );
};

export default Navigation;
