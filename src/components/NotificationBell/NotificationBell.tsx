import React from 'react';
import './NotificationBell.css';

interface Notification {
    id: number;
    title: string;
    message: string;
    time: string;
    isRead: boolean;
    icon: string;
}

const MOCK_NOTIFICATIONS: Notification[] = [
    {
        id: 1,
        title: 'Nueva Tutoría',
        message: 'Tienes una nueva solicitud de tutoría para Matemáticas.',
        time: 'Hace 5 min',
        isRead: false,
        icon: 'bi-check2-circle'
    },
    {
        id: 2,
        title: 'Actualización de Horario',
        message: 'El horario de la tutoría de Física ha cambiado.',
        time: 'Hace 20 min',
        isRead: false,
        icon: 'bi-clock'
    },
    {
        id: 3,
        title: 'Mensaje de Tutor',
        message: 'Tu tutor ha respondido a tu consulta sobre el proyecto.',
        time: 'Hace 1 hora',
        isRead: true,
        icon: 'bi-chat-left-text'
    },
    {
        id: 4,
        title: 'Calificación Publicada',
        message: 'Se ha publicado la nota final de Programación II.',
        time: 'Hace 3 horas',
        isRead: true,
        icon: 'bi-award'
    },
    {
        id: 5,
        title: 'Recordatorio',
        message: 'No olvides completar la encuesta de satisfacción.',
        time: 'Hace 1 día',
        isRead: true,
        icon: 'bi-info-circle'
    }
];

const NotificationBell: React.FC = () => {
    const [notifications, setNotifications] = React.useState<Notification[]>(MOCK_NOTIFICATIONS);
    const unreadCount = notifications.filter(n => !n.isRead).length;

    const handleMarkAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    };

    const handleMarkAsRead = (id: number) => {
        setNotifications(prev => prev.map(n =>
            n.id === id ? { ...n, isRead: true } : n
        ));
    };

    return (
        <div className="notification-bell-container">
            <div className="bell-icon-wrapper">
                <i className="bi bi-bell"></i>
                {unreadCount > 0 && (
                    <span className="notification-badge">{unreadCount}</span>
                )}
            </div>

            <div className="notifications-dropdown">
                <div className="dropdown-header">
                    <h3>Notificaciones</h3>
                    <span className="mark-read" onClick={handleMarkAllAsRead}>
                        Marcar todo como leído
                    </span>
                </div>

                <div className="notifications-list">
                    {notifications.map(notification => (
                        <div
                            key={notification.id}
                            className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                            onClick={() => handleMarkAsRead(notification.id)}
                        >
                            <div className="notif-icon">
                                <i className={`bi ${notification.icon}`}></i>
                            </div>
                            <div className="notif-content">
                                <span className="notif-title">{notification.title}</span>
                                <span className="notif-message">{notification.message}</span>
                                <span className="notif-time">{notification.time}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default NotificationBell;
