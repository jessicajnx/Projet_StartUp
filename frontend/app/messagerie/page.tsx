'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { userAPI, empruntAPI } from '@/lib/api';

interface Conversation {
  id: number;
  userName: string;
  lastMessage: string;
  timestamp: string;
  unread: boolean;
  bookTitle?: string;
}

interface Message {
  id: number;
  text: string;
  sender: 'me' | 'other';
  timestamp: string;
  bookInfo?: {
    title: string;
    author: string;
  };
}

export default function MessagériePage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [emprunts, setEmprunts] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    setIsAuthenticated(true);
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userResponse = await userAPI.getMe();
      setCurrentUser(userResponse.data);
      
      // Charger les emprunts pour créer des conversations
      const empruntsResponse = await empruntAPI.getByUser(userResponse.data.id);
      setEmprunts(empruntsResponse.data);
      
      // Créer des conversations fictives basées sur les emprunts
      const mockConversations: Conversation[] = empruntsResponse.data.map((emprunt: any, index: number) => ({
        id: emprunt.id,
        userName: emprunt.id_user1 === userResponse.data.id ? `Utilisateur ${emprunt.id_user2}` : `Utilisateur ${emprunt.id_user1}`,
        lastMessage: 'Bonjour, concernant l\'échange de livre...',
        timestamp: new Date(emprunt.datetime).toLocaleDateString(),
        unread: false,
        bookTitle: 'Livre échangé',
      }));
      
      setConversations(mockConversations);
    } catch (error) {
      console.error('Erreur lors du chargement des données', error);
    }
  };

  const handleSelectConversation = (convId: number) => {
    setSelectedConversation(convId);
    // Messages fictifs pour la démonstration
    setMessages([
      {
        id: 1,
        text: 'Bonjour ! Je suis intéressé par votre livre.',
        sender: 'other',
        timestamp: '10:30',
      },
      {
        id: 2,
        text: 'Bonjour ! Oui, il est toujours disponible.',
        sender: 'me',
        timestamp: '10:32',
      },
      {
        id: 3,
        text: 'Super ! On pourrait se rencontrer cette semaine ?',
        sender: 'other',
        timestamp: '10:35',
      },
    ]);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || selectedConversation === null) return;
    
    const message: Message = {
      id: messages.length + 1,
      text: newMessage,
      sender: 'me',
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    };
    
    setMessages([...messages, message]);
    setNewMessage('');
  };

  if (!isAuthenticated) {
    return <div>Chargement...</div>;
  }

  return (
    <div style={styles.container}>
      <Header />
      
      <main style={styles.main}>
        <div style={styles.content}>
          <h1 style={styles.title}>Messagerie</h1>
          
          <div style={styles.messagerieContainer}>
            {/* Liste des conversations */}
            <div style={styles.conversationsList}>
              <div style={styles.conversationsHeader}>
                <h2>Conversations</h2>
                <span style={styles.badge}>{conversations.length}</span>
              </div>
              
              {conversations.length === 0 ? (
                <div style={styles.emptyState}>
                  <p>Aucune conversation</p>
                  <small>Les conversations apparaîtront après vos échanges</small>
                </div>
              ) : (
                <div style={styles.conversationsItems}>
                  {conversations.map(conv => (
                    <div
                      key={conv.id}
                      style={{
                        ...styles.conversationItem,
                        ...(selectedConversation === conv.id ? styles.conversationItemActive : {})
                      }}
                      onClick={() => handleSelectConversation(conv.id)}
                    >
                      <div style={styles.conversationAvatar}>
                        {conv.userName.charAt(0)}
                      </div>
                      <div style={styles.conversationInfo}>
                        <div style={styles.conversationName}>
                          {conv.userName}
                          {conv.unread && <span style={styles.unreadDot}></span>}
                        </div>
                        {conv.bookTitle && (
                          <div style={styles.conversationBook}> {conv.bookTitle}</div>
                        )}
                        <div style={styles.conversationLastMessage}>{conv.lastMessage}</div>
                      </div>
                      <div style={styles.conversationTime}>{conv.timestamp}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Zone de messages */}
            <div style={styles.messagesArea}>
              {selectedConversation === null ? (
                <div style={styles.noConversationSelected}>
                  <div style={styles.noConvIcon}></div>
                  <h3>Sélectionnez une conversation</h3>
                  <p>Choisissez une conversation dans la liste pour commencer à discuter</p>
                </div>
              ) : (
                <>
                  <div style={styles.messagesHeader}>
                    <div style={styles.messagesHeaderInfo}>
                      <div style={styles.headerAvatar}>
                        {conversations.find(c => c.id === selectedConversation)?.userName.charAt(0)}
                      </div>
                      <div>
                        <div style={styles.headerName}>
                          {conversations.find(c => c.id === selectedConversation)?.userName}
                        </div>
                        <div style={styles.headerStatus}>En ligne</div>
                      </div>
                    </div>
                  </div>
                  
                  <div style={styles.messagesList}>
                    {messages.map(msg => (
                      <div
                        key={msg.id}
                        style={{
                          ...styles.messageItem,
                          ...(msg.sender === 'me' ? styles.messageMe : styles.messageOther)
                        }}
                      >
                        <div
                          style={{
                            ...styles.messageBubble,
                            ...(msg.sender === 'me' ? styles.messageBubbleMe : styles.messageBubbleOther)
                          }}
                        >
                          {msg.bookInfo && (
                            <div style={styles.messageBookInfo}>
                              📖 {msg.bookInfo.title} - {msg.bookInfo.author}
                            </div>
                          )}
                          <div>{msg.text}</div>
                          <div style={styles.messageTime}>{msg.timestamp}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div style={styles.messageInput}>
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Écrivez votre message..."
                      style={styles.input}
                    />
                    <button onClick={handleSendMessage} style={styles.sendButton}>
                      Envoyer
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    minHeight: '100vh',
  } as React.CSSProperties,
  main: {
    flex: 1,
    backgroundColor: '#F5E6D3',
    padding: '2rem',
  } as React.CSSProperties,
  content: {
    maxWidth: '1400px',
    margin: '0 auto',
  } as React.CSSProperties,
  title: {
    color: '#5D4E37',
    fontSize: '2.5rem',
    marginBottom: '2rem',
    textAlign: 'center' as const,
  } as React.CSSProperties,
  messagerieContainer: {
    display: 'grid',
    gridTemplateColumns: '350px 1fr',
    gap: '1.5rem',
    height: '700px',
    backgroundColor: 'white',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  } as React.CSSProperties,
  conversationsList: {
    borderRight: '1px solid #D4B59E',
    display: 'flex',
    flexDirection: 'column' as const,
  } as React.CSSProperties,
  conversationsHeader: {
    padding: '1.5rem',
    borderBottom: '1px solid #D4B59E',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F5E6D3',
  } as React.CSSProperties,
  badge: {
    backgroundColor: '#8B7355',
    color: 'white',
    padding: '0.25rem 0.75rem',
    borderRadius: '12px',
    fontSize: '0.85rem',
    fontWeight: 'bold',
  } as React.CSSProperties,
  conversationsItems: {
    overflowY: 'auto' as const,
    flex: 1,
  } as React.CSSProperties,
  conversationItem: {
    padding: '1rem',
    display: 'flex',
    gap: '1rem',
    cursor: 'pointer',
    borderBottom: '1px solid #F5E6D3',
    transition: 'background-color 0.2s',
  } as React.CSSProperties,
  conversationItemActive: {
    backgroundColor: '#F5E6D3',
  } as React.CSSProperties,
  conversationAvatar: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    backgroundColor: '#8B7355',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem',
    fontWeight: 'bold',
    flexShrink: 0,
  } as React.CSSProperties,
  conversationInfo: {
    flex: 1,
    minWidth: 0,
  } as React.CSSProperties,
  conversationName: {
    fontWeight: 'bold',
    color: '#5D4E37',
    marginBottom: '0.25rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  } as React.CSSProperties,
  conversationBook: {
    fontSize: '0.85rem',
    color: '#8B7355',
    marginBottom: '0.25rem',
  } as React.CSSProperties,
  conversationLastMessage: {
    fontSize: '0.9rem',
    color: '#8B7355',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  } as React.CSSProperties,
  conversationTime: {
    fontSize: '0.75rem',
    color: '#8B7355',
    flexShrink: 0,
  } as React.CSSProperties,
  unreadDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#FF5722',
    display: 'inline-block',
  } as React.CSSProperties,
  emptyState: {
    textAlign: 'center' as const,
    padding: '3rem 1rem',
    color: '#8B7355',
  } as React.CSSProperties,
  messagesArea: {
    display: 'flex',
    flexDirection: 'column' as const,
  } as React.CSSProperties,
  messagesHeader: {
    padding: '1.5rem',
    borderBottom: '1px solid #D4B59E',
    backgroundColor: '#F5E6D3',
  } as React.CSSProperties,
  messagesHeaderInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  } as React.CSSProperties,
  headerAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#8B7355',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.2rem',
    fontWeight: 'bold',
  } as React.CSSProperties,
  headerName: {
    fontWeight: 'bold',
    color: '#5D4E37',
  } as React.CSSProperties,
  headerStatus: {
    fontSize: '0.85rem',
    color: '#4CAF50',
  } as React.CSSProperties,
  messagesList: {
    flex: 1,
    overflowY: 'auto' as const,
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
  } as React.CSSProperties,
  messageItem: {
    display: 'flex',
    width: '100%',
  } as React.CSSProperties,
  messageMe: {
    justifyContent: 'flex-end',
  } as React.CSSProperties,
  messageOther: {
    justifyContent: 'flex-start',
  } as React.CSSProperties,
  messageBubble: {
    maxWidth: '70%',
    padding: '0.75rem 1rem',
    borderRadius: '12px',
    wordWrap: 'break-word' as const,
  } as React.CSSProperties,
  messageBubbleMe: {
    backgroundColor: '#8B7355',
    color: 'white',
  } as React.CSSProperties,
  messageBubbleOther: {
    backgroundColor: '#F5E6D3',
    color: '#5D4E37',
  } as React.CSSProperties,
  messageBookInfo: {
    fontSize: '0.85rem',
    marginBottom: '0.5rem',
    padding: '0.5rem',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: '4px',
  } as React.CSSProperties,
  messageTime: {
    fontSize: '0.75rem',
    marginTop: '0.25rem',
    opacity: 0.7,
  } as React.CSSProperties,
  messageInput: {
    padding: '1rem',
    borderTop: '1px solid #D4B59E',
    display: 'flex',
    gap: '1rem',
  } as React.CSSProperties,
  input: {
    flex: 1,
    padding: '0.75rem',
    border: '2px solid #D4B59E',
    borderRadius: '8px',
    fontSize: '1rem',
  } as React.CSSProperties,
  sendButton: {
    backgroundColor: '#8B7355',
    color: 'white',
    border: 'none',
    padding: '0.75rem 2rem',
    borderRadius: '8px',
    fontSize: '1rem',
    cursor: 'pointer',
    fontWeight: 'bold',
  } as React.CSSProperties,
  noConversationSelected: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    color: '#8B7355',
    padding: '2rem',
  } as React.CSSProperties,
  noConvIcon: {
    fontSize: '5rem',
    marginBottom: '1rem',
  } as React.CSSProperties,
};
