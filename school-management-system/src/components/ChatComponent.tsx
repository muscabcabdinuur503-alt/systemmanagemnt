import React, { useState, useEffect, useRef } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { Send, Image as ImageIcon } from 'lucide-react';

interface ChatComponentProps {
  currentUserId: string;
  senderName: string;
  chatId: string;
  receiverName: string;
  members?: string[];
}

export const ChatComponent: React.FC<ChatComponentProps> = ({ currentUserId, senderName, chatId, receiverName, members }) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const q = query(
      collection(db, 'chatMessages'),
      where('chatId', '==', chatId)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => {
        const data = doc.data();
        let msgDate = new Date();
        if (data.timestamp) {
          if (typeof data.timestamp.toDate === 'function') {
            msgDate = data.timestamp.toDate();
          } else {
            msgDate = new Date(data.timestamp);
          }
        }
        return {
          id: doc.id,
          ...data,
          _date: msgDate
        };
      });
      msgs.sort((a, b) => a._date.getTime() - b._date.getTime());
      setMessages(msgs);
    }, (error) => {
      console.error("Firestore Chat error:", error);
    });
    return unsubscribe;
  }, [chatId]);

  const sendMessage = async (imageUrl?: string) => {
    if (newMessage.trim() === '' && !imageUrl) return;
    await addDoc(collection(db, 'chatMessages'), {
      chatId,
      senderId: currentUserId,
      senderName,
      text: newMessage,
      imageUrl: imageUrl || null,
      timestamp: serverTimestamp(),
    });
    setNewMessage('');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        sendMessage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border border-slate-200 rounded-2xl shadow-sm">
      <div className="p-4 border-b border-slate-100">
        <h3 className="font-black text-slate-800">Sheekaysi: {receiverName}</h3>
        {members && (
          <p className="text-[10px] text-slate-400 mt-1">
            Xubnaha: {members.join(', ')}
          </p>
        )}
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Ma jirto fariimo. Bilow wada-sheekaysiga!
            </div>
        ) : (
            messages.map(msg => (
            <div key={msg.id} className={`flex flex-col ${msg.senderId === currentUserId ? 'items-end' : 'items-start'}`}>
                <span className="text-[9px] text-slate-400 mb-1">{msg.senderName}</span>
                <div className={`p-3 rounded-2xl text-xs ${msg.senderId === currentUserId ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-800'}`}>
                {msg.text}
                {msg.imageUrl && <img src={msg.imageUrl} className="max-w-xs mt-2 rounded-lg" alt="chat" />}
                </div>
            </div>
            ))
        )}
      </div>
      <div className="p-4 border-t border-slate-100 flex gap-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageUpload}
          className="hidden"
          accept="image/*"
        />
        <button onClick={() => fileInputRef.current?.click()} className="p-2 text-slate-500 hover:text-indigo-600">
          <ImageIcon className="w-4 h-4" />
        </button>
        <input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Qor fariin..."
          className="flex-1 border border-slate-200 rounded-lg p-2 text-xs"
        />
        <button onClick={() => sendMessage()} className="p-2 bg-indigo-600 text-white rounded-lg">
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
