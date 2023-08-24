import React from "react";
import { AiFillTwitterCircle } from "react-icons/ai";
import { RiTelegramFill } from "react-icons/ri";
// import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <>
      <footer className="footer-area">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 col-md-8 text-center">
              <div className="footer-items">
                <div className="social-icons d-flex justify-content-center my-4">
                  <a
                    className="twitter"
                    href="https://twitter.com/BankOfShibarium/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <AiFillTwitterCircle />
                  </a>
                  <a
                    className="telegram"
                    href="https://t.me/BankOfShibarium/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <RiTelegramFill />
                  </a>
                </div>
                <div className="copyright-area py-2">
                  Copyright &copy; 2023 Bank Of Shibarium. All Rights Reserved.
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
