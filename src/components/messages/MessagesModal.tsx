import React, { useState } from 'react';
import { useRealEstate } from '../../context/RealEstateContext';
import { X, Send, MessageSquare, Building2, User } from 'lucide-react';

interface MessagesModalProps {
  onClose: () => void;
  initialRecipientId?: string;
  initialPropertyTitle?: string;
}

export const MessagesModal: React.FC<MessagesModalProps> = ({
  onClose,
  initialRecipientId,
  initialPropertyTitle
}) => {
  const { currentUser, users, messages, sendMessage, properties } = useRealEstate();

  // Find contacts available to chat with
  const availableContacts = users.filter(u => u.id !== currentUser.id);

  const [selectedRecipientId, setSelectedRecipientId] = useState<string>(
    initialRecipientId || availableContacts[0]?.id || ''
  );
  const [inputText, setInputText] = useState('');

  const activeRecipient = users.find(u => u.id === selectedRecipientId);

  // Filter messages between current user and selected recipient
  const conversation = messages.filter(
    m =>
      (m.senderId === currentUser.id && m.receiverId === selectedRecipientId) ||
      (m.senderId === selectedRecipientId && m.receiverId === currentUser.id)
  );

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedRecipientId) return;

    sendMessage(
      selectedRecipientId,
      inputText.trim(),
      undefined,
      initialPropertyTitle
    );
    setInputText('');
  };

  const QUICK_TEMPLATES = [
    'Confirming our scheduled inspection window for this week.',
    'Could you please verify the updated lease agreement terms?',
    'Thank you! The maintenance issue has been inspected and tested.',
    'Where can I submit the guest vehicle registration for the garage?'
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div
        className="bg-white rounded-2xl max-w-3xl w-full h-[600px] shadow-2xl border border-slate-200 relative flex flex-col overflow-hidden text-slate-800"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 px-6 border-b border-slate-200 flex items-center justify-between bg-white z-10 shrink-0">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-indigo-600" />
            <div>
              <h2 className="text-base font-bold text-slate-900">Tenant & Manager Communications</h2>
              <p className="text-xs text-slate-500">Direct instant messaging thread</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2-Column Chat Layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* Contacts Sidebar */}
          <div className="w-64 border-r border-slate-200 bg-slate-50 flex flex-col shrink-0">
            <div className="p-3 border-b border-slate-200 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Conversations
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {availableContacts.map(contact => {
                const isSelected = contact.id === selectedRecipientId;
                const lastMsg = messages
                  .filter(
                    m =>
                      (m.senderId === currentUser.id && m.receiverId === contact.id) ||
                      (m.senderId === contact.id && m.receiverId === currentUser.id)
                  )
                  .slice(-1)[0];

                return (
                  <button
                    key={contact.id}
                    onClick={() => setSelectedRecipientId(contact.id)}
                    className={`w-full text-left p-2.5 rounded-xl transition-colors cursor-pointer flex items-center gap-3 ${
                      isSelected ? 'bg-indigo-50 border border-indigo-200 text-indigo-900' : 'hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-semibold text-xs flex items-center justify-center shrink-0">
                      {contact.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-xs truncate text-slate-900">{contact.name}</div>
                      <div className="text-[11px] text-slate-500 capitalize truncate">
                        {contact.role} {contact.company ? `· ${contact.company}` : ''}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Conversation Area */}
          <div className="flex-1 flex flex-col bg-white overflow-hidden">
            {activeRecipient ? (
              <>
                {/* Chat Top Banner */}
                <div className="p-3 px-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-slate-900">{activeRecipient.name}</span>
                    <span className="text-slate-400 text-xs">({activeRecipient.email})</span>
                  </div>
                  {initialPropertyTitle && (
                    <span className="text-[11px] text-slate-500 truncate max-w-[200px]">
                      Re: {initialPropertyTitle}
                    </span>
                  )}
                </div>

                {/* Messages Feed */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {conversation.length === 0 ? (
                    <div className="text-center py-16 text-slate-400 text-xs">
                      No messages yet. Send a note or pick a quick suggestion below to begin!
                    </div>
                  ) : (
                    conversation.map(msg => {
                      const isMe = msg.senderId === currentUser.id;
                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs ${
                              isMe
                                ? 'bg-indigo-600 text-white rounded-br-xs'
                                : 'bg-slate-100 text-slate-800 rounded-bl-xs'
                            }`}
                          >
                            <p className="leading-relaxed">{msg.message}</p>
                          </div>
                          <span className="text-[10px] text-slate-400 mt-1 px-1">
                            {msg.senderName} · {msg.timestamp}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Quick Templates Strip */}
                <div className="px-4 py-2 border-t border-slate-100 bg-slate-50 flex items-center gap-2 overflow-x-auto whitespace-nowrap">
                  <span className="text-[11px] text-slate-400 font-medium shrink-0">Quick prompt:</span>
                  {QUICK_TEMPLATES.map((tmpl, idx) => (
                    <button
                      key={idx}
                      onClick={() => setInputText(tmpl)}
                      className="px-2.5 py-1 text-[11px] bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300 rounded-md transition-colors cursor-pointer shrink-0"
                    >
                      {tmpl.length > 30 ? tmpl.substring(0, 30) + '...' : tmpl}
                    </button>
                  ))}
                </div>

                {/* Send Bar */}
                <form onSubmit={handleSend} className="p-3 border-t border-slate-200 flex items-center gap-2 bg-white shrink-0">
                  <input
                    type="text"
                    value={inputText}
                    onChange={e => setInputText(e.target.value)}
                    placeholder={`Message ${activeRecipient.name}...`}
                    className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="submit"
                    disabled={!inputText.trim()}
                    className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send</span>
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-400 text-xs">
                Select a contact on the left to start messaging.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
