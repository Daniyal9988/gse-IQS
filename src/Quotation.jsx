import React, { useState, useEffect, useRef } from 'react';
import Papa from 'papaparse';
import styles from './Styles/Quotation.module.css';
import headerImg from './assets/header-logo.png'; 
import footerImg from './assets/footer-logo.png';

const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRitGV6fllAcO7EYJVt8AHkkosDXN7OEHln9Q3ovPaJigCwM_xgz37sY_1O4k2P-dc1gBUSoYNB1_kI/pub?output=csv";

const Quotation = () => {
  const [stockData, setStockData] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [items, setItems] = useState([{ id: Date.now(), code: '', desc: '', qty: 1, unitPrice: 0, showCodeDropdown: false, showDescDropdown: false }]);
  const [clientName, setClientName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [contactNo, setContactNo] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // New Error State
  
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
  const companyRef = useRef(null);

  useEffect(() => {
    Papa.parse(SHEET_URL, {
      download: true,
      header: true,
      complete: (results) => {
        if (results.data && results.data.length > 0) {
          setStockData(results.data);
          const allHeaders = Object.keys(results.data[0]);
          const companyList = allHeaders.filter(header => 
            !['Code', 'Description', 'Standard'].includes(header.trim()) && header.trim() !== ""
          );
          setCompanies(companyList);
          setLoading(false);
        } else {
          setError("Spreadsheet is empty or headers are missing.");
          setLoading(false);
        }
      },
      error: (err) => {
        console.error("CSV Parse Error:", err);
        setError("Failed to connect to Google Sheets. Please check your internet connection or URL.");
        setLoading(false);
      }
    });

    const handleClickOutside = (event) => {
      if (companyRef.current && !companyRef.current.contains(event.target)) {
        setShowCompanyDropdown(false);
      }
      setItems(prev => prev.map(item => ({ ...item, showCodeDropdown: false, showDescDropdown: false })));
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setItems([{ id: Date.now(), code: '', desc: '', qty: 1, unitPrice: 0, showCodeDropdown: false, showDescDropdown: false }]);
  }, [clientName]);

  const handleItemUpdate = (index, field, value) => {
    const updatedItems = [...items];
    updatedItems[index][field] = value;

    if (field === 'code') {
      updatedItems[index].showCodeDropdown = true;
      const match = stockData.find(s => s.Code && s.Code.toString().trim().toUpperCase() === value.trim().toUpperCase());
      if (match) {
        updatedItems[index].desc = match.Description || "";
        const clientKey = Object.keys(match).find(key => key.trim().toUpperCase() === clientName.trim().toUpperCase());
        updatedItems[index].unitPrice = clientKey ? parseFloat(match[clientKey]) : parseFloat(match.Standard || 0);
      }
    }

    if (field === 'desc' && updatedItems[index].code.toUpperCase() === 'LT') {
      updatedItems[index].showDescDropdown = true;
      const match = stockData.find(s => s.Description && s.Description.toString().trim().toUpperCase() === value.trim().toUpperCase());
      if (match) {
        const clientKey = Object.keys(match).find(key => key.trim().toUpperCase() === clientName.trim().toUpperCase());
        updatedItems[index].unitPrice = clientKey ? parseFloat(match[clientKey]) : parseFloat(match.Standard || 0);
      }
    }
    setItems(updatedItems);
  };

  const selectCode = (index, selectedCode) => {
    const updatedItems = [...items];
    if (selectedCode === 'LT') {
      updatedItems[index].code = 'LT';
      updatedItems[index].desc = '';
      updatedItems[index].unitPrice = 0;
    } else {
      const match = stockData.find(s => s.Code === selectedCode);
      if (match) {
        updatedItems[index].code = selectedCode;
        updatedItems[index].desc = match.Description || "";
        const clientKey = Object.keys(match).find(key => key.trim().toUpperCase() === clientName.trim().toUpperCase());
        updatedItems[index].unitPrice = clientKey ? parseFloat(match[clientKey]) : parseFloat(match.Standard || 0);
      }
    }
    updatedItems[index].showCodeDropdown = false;
    setItems(updatedItems);
  };

  const selectDesc = (index, selectedDesc) => {
    const updatedItems = [...items];
    const match = stockData.find(s => s.Description === selectedDesc);
    if (match) {
      updatedItems[index].desc = selectedDesc;
      const clientKey = Object.keys(match).find(key => key.trim().toUpperCase() === clientName.trim().toUpperCase());
      updatedItems[index].unitPrice = clientKey ? parseFloat(match[clientKey]) : parseFloat(match.Standard || 0);
    }
    updatedItems[index].showDescDropdown = false;
    setItems(updatedItems);
  };

  const addRow = () => setItems([...items, { id: Date.now(), code: '', desc: '', qty: 1, unitPrice: 0, showCodeDropdown: false, showDescDropdown: false }]);
  const removeRow = (id) => items.length > 1 && setItems(items.filter(item => item.id !== id));

  const subtotal = items.reduce((sum, item) => sum + (Number(item.qty) * Number(item.unitPrice)), 0);
  const vat = subtotal * 0.15;
  const total = subtotal + vat;

  // Render Loader
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Connecting to GSE Database...</p>
      </div>
    );
  }

  // Render Error
  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorBox}>
          <h2>Connection Error</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Retry Connection</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.imageHeader}>
        <img src={headerImg} alt="Header" className={styles.headerImg} />
      </div>

      <div className={styles.mainContent}>
        <div className={styles.topSection}>
          <h3 className={styles.sectionTitle}>Bill To</h3>
          <div className={styles.flexRow}>
            <div className={styles.leftCol}>
              <span className={styles.label}>Company Name:</span>
              <div className={styles.searchWrapper} ref={companyRef}>
                <input 
                  className={styles.noLineInput} 
                  value={clientName} 
                  onChange={(e) => {
                    setClientName(e.target.value);
                    setShowCompanyDropdown(true);
                  }}
                  onFocus={() => setShowCompanyDropdown(true)}
                  placeholder="Select or type Company Name"
                />
                {showCompanyDropdown && (
                  <div className={styles.customDropdown}>
                    {companies
                      .filter(c => c.toLowerCase().includes(clientName.toLowerCase()))
                      .map((company, i) => (
                        <div key={i} className={styles.dropdownItem} onClick={() => { setClientName(company); setShowCompanyDropdown(false); }}>
                          {company}
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
            <div className={styles.rightCol}>
              <span className={styles.labelRight}>Date Issued:</span>
              <input type="date" className={styles.noLineInputRight} defaultValue={new Date().toISOString().split('T')[0]} />
            </div>
          </div>

          <div className={styles.flexRow}>
            <div className={styles.leftCol}>
              <span className={styles.label}>Contact Person:</span>
              <input placeholder='Enter Contact Person Name' className={styles.noLineInput} value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} />
            </div>
            <div className={styles.rightCol}>
              <span className={styles.labelRight}>Quotation #:</span>
              <input  className={styles.noLineInputRight} placeholder="QT-XXXXXX" />
            </div>
          </div>

          <div className={styles.flexRow}>
            <div className={styles.leftCol}>
              <span className={styles.label}>Contact No:</span>
              <input placeholder='Enter Contact Person Number' className={styles.noLineInput} value={contactNo} onChange={(e) => setContactNo(e.target.value)} />
            </div>
            <div className={styles.rightCol}>
              <span className={styles.labelRight}>Valid Until:</span>
              <input type="date" className={styles.noLineInputRight} />
            </div>
          </div>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={`${styles.colSn} ${styles.leftAlign}`}>Sn</th>
                <th className={`${styles.colCode} ${styles.leftAlign}`}>Code</th>
                <th className={`${styles.colDesc} ${styles.leftAlign}`}>Description</th>
                <th className={`${styles.colQty} ${styles.centerAlign}`}>Qty</th>
                <th className={`${styles.colPrice} ${styles.centerAlign}`}>Unit Price</th>
                <th className={`${styles.colTotal} ${styles.rightAlignHeader}`}>Total Price</th>
                <th className={`${styles.colAction} ${styles.printHidden}`}></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={item.id}>
                  <td className={styles.textLeft}><input className={styles.cellInput} value={idx + 1} readOnly /></td>
                  <td className={styles.textLeft} style={{ position: 'relative' }}>
                    <input 
                      className={styles.cellInput} 
                      value={item.code} 
                      onChange={(e) => handleItemUpdate(idx, 'code', e.target.value)}
                      onFocus={() => handleItemUpdate(idx, 'showCodeDropdown', true)}
                      placeholder="Code or LT"
                    />
                    {item.showCodeDropdown && (
                      <div className={styles.tableDropdown}>
                        <div className={styles.dropdownItem} onMouseDown={() => selectCode(idx, 'LT')}><strong>LT (Local Tool)</strong></div>
                        {stockData
                          .filter(s => s.Code && s.Code.toString().toLowerCase().includes(item.code.toLowerCase()))
                          .slice(0, 5)
                          .map((s, i) => (
                            <div key={i} className={styles.dropdownItem} onMouseDown={() => selectCode(idx, s.Code)}>
                              {s.Code}
                            </div>
                          ))}
                      </div>
                    )}
                  </td>
                  <td className={styles.textLeft} style={{ position: 'relative' }}>
                    <input 
                      className={styles.cellInput} 
                      value={item.desc} 
                      onChange={(e) => handleItemUpdate(idx, 'desc', e.target.value)} 
                      onFocus={() => { if(item.code.toUpperCase() === 'LT') handleItemUpdate(idx, 'showDescDropdown', true); }}
                    />
                    {item.showDescDropdown && item.code.toUpperCase() === 'LT' && item.desc && (
                      <div className={styles.tableDropdown}>
                        {stockData
                          .filter(s => (!s.Code || s.Code === "") && s.Description && s.Description.toString().toLowerCase().includes(item.desc.toLowerCase()))
                          .slice(0, 10)
                          .map((s, i) => (
                            <div key={i} className={styles.dropdownItem} onMouseDown={() => selectDesc(idx, s.Description)}>
                              {s.Description}
                            </div>
                          ))}
                      </div>
                    )}
                  </td>
                  <td className={styles.textCenter}><input type="number" className={`${styles.cellInput} ${styles.textCenter}`} value={item.qty} onChange={(e) => handleItemUpdate(idx, 'qty', e.target.value)} /></td>
                  <td className={styles.textCenter}><input type="number" readOnly className={`${styles.cellInput} ${styles.textCenter}`} value={item.unitPrice} onChange={(e) => handleItemUpdate(idx, 'unitPrice', e.target.value)} /></td>
                  <td className={`${styles.textRight} ${styles.totalCell}`}>{(item.qty * item.unitPrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td className={`${styles.colAction} ${styles.printHidden}`}>
                    <button onClick={() => removeRow(item.id)} className={styles.deleteBtn}>×</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button className={`${styles.addButton} ${styles.printHidden}`} onClick={addRow}>+ Add Item</button>

        <div className={styles.summaryContainer}>
          <div className={styles.summaryBox}>
            <div className={styles.summaryLine}><span>Subtotal</span><span>{subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
            <div className={styles.summaryLine}><span>VAT (15%)</span><span>{vat.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
            <div className={styles.totalLine}><span>Total (Incl. VAT)</span><span>{total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
          </div>
        </div>
      </div>

      <div className={styles.footerGroup}>
        <div className={styles.termsFooter}>
          <h4>Terms and Conditions</h4>
          <p>1. Prices are in Saudi Riyals (SAR).</p>
          <p>2. 50% Advance payment required. Balance prior to delivery.</p>
          <p>3. Valid for 7 days.</p>
          <div className={styles.bankSection}>
            <strong>Bank Details:</strong>
            <p>Riyad Bank</p>
          </div>
        </div>
        <div className={styles.imageFooter}>
          <img src={footerImg} alt="Footer Logo" className={styles.footerImg} />
        </div>
      </div>

      <div className={`${styles.actions} ${styles.printHidden}`}>
        <button className={styles.printButton} onClick={() => window.print()}>Print Quotation</button>
      </div>
    </div>
  );
};

export default Quotation;