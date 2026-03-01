import Header from './Header'
import Sidebar from './Sidebar'
import { colors, baseStyles } from '../../config/styleConstants'
import { useApp } from '../../context/AppContext'

function Layout({ children }) {
  const { state, actions } = useApp()

  const layoutStyle = {
    minHeight: '100vh',
    background: `linear-gradient(135deg, ${colors.gray[50]} 0%, ${colors.gray[100]} 100%)`,
    fontFamily: baseStyles.fontFamily,
  }

  const mainContainerStyle = {
    display: 'flex',
    minHeight: 'calc(100vh - 60px)',
  }

  const contentStyle = {
    flex: 1,
    overflow: 'auto',
    padding: '0',
  }

  // Notification Toast
  const notificationStyle = {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    padding: '14px 24px',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: 500,
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    animation: 'slideIn 0.3s ease',
    ...(state.ui.notification?.type === 'success' && {
      background: colors.status.success.bg,
      color: colors.status.success.text,
      border: `1px solid ${colors.status.success.border}`,
    }),
    ...(state.ui.notification?.type === 'error' && {
      background: colors.status.error.bg,
      color: colors.status.error.text,
      border: `1px solid ${colors.status.error.border}`,
    }),
    ...(state.ui.notification?.type === 'warning' && {
      background: colors.status.warning.bg,
      color: colors.status.warning.text,
      border: `1px solid ${colors.status.warning.border}`,
    }),
    ...(!state.ui.notification?.type || state.ui.notification?.type === 'info' && {
      background: colors.status.info.bg,
      color: colors.status.info.text,
      border: `1px solid ${colors.status.info.border}`,
    }),
  }

  const notificationIcons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
  }

  return (
    <div style={layoutStyle}>
      <Header />
      <div style={mainContainerStyle}>
        <Sidebar />
        <main style={contentStyle}>
          {children}
        </main>
      </div>

      {/* Notification Toast */}
      {state.ui.notification && (
        <div style={notificationStyle}>
          <span>{notificationIcons[state.ui.notification.type] || 'ℹ️'}</span>
          <span>{state.ui.notification.message}</span>
          <button
            onClick={() => actions.clearNotification()}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0 0 0 10px',
              fontSize: '16px',
              opacity: 0.7,
            }}
          >
            ×
          </button>
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}

export default Layout
