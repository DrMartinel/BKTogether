import './ServicesScreen.css'
import { useState, useEffect } from 'react'
import { user } from '../data/user'

const ServicesScreen = () => {
  const [activeTab, setActiveTab] = useState('topup')
  const [bkBalance, setBkBalance] = useState(user.bkCredit.balance / 100)
  const [bkPlusBalance, setBkPlusBalance] = useState(user.bkCreditPlus.balance / 100)
  const [confirmModal, setConfirmModal] = useState(null)
  const [voucherCode, setVoucherCode] = useState('')
  const [appliedVoucher, setAppliedVoucher] = useState(null)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    // keep local balances in sync with global user object
    setBkBalance(user.bkCredit.balance / 100)
    setBkPlusBalance(user.bkCreditPlus.balance / 100)
  }, [])

  const vouchers = [
    { code: 'SAVE5', desc: 'Get 5.000 ₫ off your next top up', value: 5 },
    { code: 'PLUS10', desc: 'Buy BKCreditPlus and get +10% bonus', bonusPercent: 10 },
  ]

  const offers = [
    { id: 1, title: 'Weekend Bonus', desc: 'Top up 20.000 ₫ and get 3.000 ₫ bonus', min: 20, bonus: 3 },
    { id: 2, title: 'First Time Top Up', desc: 'New users get 2.000 ₫ instant credit', min: 0, bonus: 2 },
  ]

  const packages = {
    bk: [
      { id: 'bk-5', price: 5, credit: 5 },
      { id: 'bk-10', price: 10, credit: 10 },
      { id: 'bk-20', price: 20, credit: 20 },
    ],
    bkplus: [
      { id: 'plus-10', price: 10, credit: 12 },
      { id: 'plus-25', price: 25, credit: 28 },
      { id: 'plus-50', price: 50, credit: 60 },
    ],
  }

  const applyVoucher = (code) => {
    const v = vouchers.find((x) => x.code.toLowerCase() === (code || '').toLowerCase())
    if (!v) {
      setMessage({ type: 'error', text: 'Invalid voucher code' })
      setTimeout(() => setMessage(null), 2000)
      return
    }
    setAppliedVoucher(v)
    setMessage({ type: 'success', text: `Voucher ${v.code} applied` })
    setTimeout(() => setMessage(null), 2000)
  }

  const buyPackage = (pkg, type) => {
    // Open confirmation modal; actual purchase happens on confirm
    let finalCredit = pkg.credit
    let finalPrice = pkg.price
    if (appliedVoucher) {
      if (appliedVoucher.value) {
        finalPrice = Math.max(0, finalPrice - appliedVoucher.value)
      }
      if (appliedVoucher.bonusPercent && type === 'bkplus') {
        finalCredit = Math.round(finalCredit * (1 + appliedVoucher.bonusPercent / 100))
      }
    }
    // Treat package.price as thousands of VND for display
    const priceVnd = finalPrice * 1000
    setConfirmModal({ pkg, type, finalCredit, finalPrice, priceVnd, customVnd: '' })
  }

  const proceedPurchase = (pkg, type, finalCredit, finalPrice) => {
    // Persist purchase (existing internal balance unit uses credit * 100)
    if (type === 'bk') {
      user.bkCredit.balance += finalCredit * 100
      setBkBalance(user.bkCredit.balance / 100)
    } else {
      user.bkCreditPlus.balance += finalCredit * 100
      setBkPlusBalance(user.bkCreditPlus.balance / 100)
    }

    const priceVnd = finalPrice * 1000
    setMessage({ type: 'success', text: `Purchased ${finalCredit} credits for ${new Intl.NumberFormat('vi-VN').format(priceVnd)} ₫` })
    setTimeout(() => setMessage(null), 2200)
    setAppliedVoucher(null)
    setConfirmModal(null)
  }

  const claimOffer = (offer) => {
    // simple immediate bonus when claim
    user.bkCredit.balance += (offer.bonus || 0) * 100
    setBkBalance(user.bkCredit.balance / 100)
    const bonusVnd = (offer.bonus || 0) * 1000
    setMessage({ type: 'success', text: `${new Intl.NumberFormat('vi-VN').format(bonusVnd)} ₫ bonus applied` })
    setTimeout(() => setMessage(null), 2000)
  }

  return (
    <div className="services-screen">
      <div className="services-header">
        <h1>Top Up</h1>
      </div>

      <div className="topup-container">
        <div className="topup-left">
          <div className="wallet-card">
            <div className="wallet-row">
              <div>
                <div className="wallet-label">BKCredit</div>
                <div className="wallet-balance">{bkBalance.toFixed(2)} credits</div>
              </div>
              <div>
                <button className="wallet-action" onClick={() => setActiveTab('topup')}>Top Up</button>
              </div>
            </div>
            <div className="wallet-row">
              <div>
                <div className="wallet-label">BKCreditPlus</div>
                <div className="wallet-balance">{bkPlusBalance.toFixed(2)} credits</div>
              </div>
              <div>
                <button className="wallet-action" onClick={() => setActiveTab('topup')}>Top Up</button>
              </div>
            </div>
          </div>

          <div className="tabs">
            <button className={`tab ${activeTab === 'topup' ? 'active' : ''}`} onClick={() => setActiveTab('topup')}>Top Up</button>
            <button className={`tab ${activeTab === 'vouchers' ? 'active' : ''}`} onClick={() => setActiveTab('vouchers')}>Vouchers</button>
            <button className={`tab ${activeTab === 'offers' ? 'active' : ''}`} onClick={() => setActiveTab('offers')}>Offers</button>
          </div>

          <div className="tab-content">
            {activeTab === 'topup' && (
              <div>
                <div className="section-title">Buy Credit Packages</div>
                <div className="packages">
                  <div className="package-group">
                    <h4>BKCredit</h4>
                    <div className="package-list">
                      {packages.bk.map((p) => (
                        <div key={p.id} className="package-card">
                          <div className="pkg-amount">{new Intl.NumberFormat('vi-VN').format(p.price * 1000)} ₫</div>
                          <div className="pkg-credit">{p.credit} credits</div>
                          <button className="pkg-buy" onClick={() => buyPackage(p, 'bk')}>Buy</button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="package-group">
                    <h4>BKCreditPlus</h4>
                    <div className="package-list">
                      {packages.bkplus.map((p) => (
                        <div key={p.id} className="package-card">
                          <div className="pkg-amount">{new Intl.NumberFormat('vi-VN').format(p.price * 1000)} ₫</div>
                          <div className="pkg-credit">{p.credit} credits</div>
                          <button className="pkg-buy" onClick={() => buyPackage(p, 'bkplus')}>Buy</button>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                <div className="section-title">Apply Voucher</div>
                <div className="voucher-row">
                  <input placeholder="Enter voucher code" value={voucherCode} onChange={(e) => setVoucherCode(e.target.value)} />
                  <button onClick={() => applyVoucher(voucherCode)} className="apply-voucher">Apply</button>
                </div>
                {appliedVoucher && <div className="applied">Applied: {appliedVoucher.code} — {appliedVoucher.desc}</div>}
              </div>
            )}

            {activeTab === 'vouchers' && (
              <div>
                <div className="section-title">Available Vouchers</div>
                <div className="voucher-list">
                  {vouchers.map((v) => (
                    <div key={v.code} className="voucher-card">
                      <div className="voucher-info">
                        <div className="voucher-code">{v.code}</div>
                        <div className="voucher-desc">{v.desc}</div>
                      </div>
                      <button className="voucher-claim" onClick={() => { setAppliedVoucher(v); setMessage({ type: 'success', text: 'Voucher claimed' }); setTimeout(() => setMessage(null), 1700) }}>Claim</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'offers' && (
              <div>
                <div className="section-title">Current Offers</div>
                <div className="offers-list">
                  {offers.map((o) => (
                    <div key={o.id} className="offer-card">
                      <div>
                        <div className="offer-title">{o.title}</div>
                        <div className="offer-desc">{o.desc}</div>
                      </div>
                      <button className="offer-claim" onClick={() => claimOffer(o)}>Claim</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="topup-right">
          <div className="help-card">
            <h4>How it works</h4>
            <p>Top up your wallet instantly. BKCredit is the regular credit, BKCreditPlus includes bonus credits and promotions.</p>
            <ul>
              <li>Buy credit packages or enter a custom amount.</li>
              <li>Apply vouchers for discounts or bonuses.</li>
              <li>Credits are shown in the wallet and can be used for payments.</li>
            </ul>
          </div>

          {message && (
            <div className={`toast ${message.type === 'error' ? 'err' : 'ok'}`}>{message.text}</div>
          )}
        </div>
      
      {confirmModal && (
            <div className="confirm-modal-overlay">
              <div className="confirm-modal">
                <h3>Confirm Purchase</h3>
                <p>Package: <strong>{confirmModal.pkg?.id || 'Custom amount'}</strong></p>
                <p>Credits: <strong>{confirmModal.finalCredit}</strong></p>
                <p>Price: <strong>{new Intl.NumberFormat('vi-VN').format(confirmModal.priceVnd)} ₫</strong></p>
                <div style={{ marginTop: 8 }}>
                  <label style={{ display: 'block', marginBottom: 6 }}>Or enter custom amount (VNĐ)</label>
                  <input
                    type="number"
                    placeholder="e.g. 50000"
                    value={confirmModal.customVnd || ''}
                    onChange={(e) => setConfirmModal({ ...confirmModal, customVnd: e.target.value })}
                    style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #eee' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <button
                    className="pkg-buy"
                    onClick={() => {
                      const cv = Number(confirmModal.customVnd)
                      if (cv && cv > 0) {
                        const credits = Math.round(cv / 1000)
                        const priceThousand = Math.round(cv / 1000)
                        proceedPurchase(confirmModal.pkg, confirmModal.type, credits, priceThousand)
                        return
                      }
                      proceedPurchase(confirmModal.pkg, confirmModal.type, confirmModal.finalCredit, confirmModal.finalPrice)
                    }}
                  >
                    Confirm
                  </button>
                  <button className="tab" onClick={() => setConfirmModal(null)}>Cancel</button>
                </div>
              </div>
            </div>
      )}
      </div>
    </div>
  )
}

export default ServicesScreen

