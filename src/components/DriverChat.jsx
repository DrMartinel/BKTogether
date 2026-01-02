import React, { useEffect, useRef, useState } from 'react'
import './DriverChat.css'
import { getDriverReply } from '../data/fakeMessages'

const DriverChat = ({ driver = {}, onClose }) => {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'driver', text: `Hi, I'm ${driver.name || 'Driver'}. See you soon.` },
    { id: 2, sender: 'user', text: 'Great, see you!' },
  ])
  const [input, setInput] = useState('')
  const messagesRef = useRef(null)
  const idRef = useRef(3)

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight
    }
  }

  const sendMessage = () => {
    const text = input.trim()
    if (!text) return
    const userMsg = { id: idRef.current++, sender: 'user', text }
    setMessages(prev => [...prev, userMsg])
    setInput('')

    // Ask fake engine for a reply
    const reply = getDriverReply(text, driver)
    setTimeout(() => {
      const driverMsg = { id: idRef.current++, sender: 'driver', text: reply.text }
      setMessages(prev => [...prev, driverMsg])
    }, reply.delay)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') sendMessage()
  }

  return (
    <div className="driver-chat-overlay">
      <div className="driver-chat">
        <div className="chat-header">
          <div>
            <strong>{driver.name || 'Driver'}</strong>
            <div className="chat-sub">Messaging</div>
          </div>
          <button className="chat-close" onClick={onClose} aria-label="Close chat">×</button>
        </div>

        <div className="chat-messages" ref={messagesRef}>
          {messages.map(m => (
            <div key={m.id} className={`chat-message ${m.sender === 'user' ? 'user' : 'driver'}`}>
              <div className="msg-content">{m.text}</div>
            </div>
          ))}
        </div>

        <div className="chat-input-row">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            aria-label="Message input"
          />
          <button className="chat-send" onClick={sendMessage}>Send</button>
        </div>
      </div>
    </div>
  )
}

export default DriverChat
