import React, { useState } from 'react'
import { useApp } from '../contexts/AppContext'
import { theme, styles } from '../lib/theme'

export default function SettingsPage() {
  const { 
    t, language, setLanguage, signOut, profile, household,
    tags, bases, householdMembers,
    addTag, updateTag, deleteTag,
    addBase, updateBase, deleteBase,
    inviteToHousehold
  } = useApp()
  
  const [activeSection, setActiveSection] = useState(null)
  const [editingItem, setEditingItem] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteLoading, setInviteLoading] = useState(false)
  const [inviteSuccess, setInviteSuccess] = useState(false)
  
  const getName = (item) => {
    if (!item) return ''
    return language === 'fr' ? (item.name_fr || item.name) : (item.name_en || item.name)
  }
  
  const handleInvite = async (e) => {
    e.preventDefault()
    if (!inviteEmail.trim()) return
    
    setInviteLoading(true)
    try {
      await inviteToHousehold(inviteEmail.trim())
      setInviteEmail('')
      setInviteSuccess(true)
      setTimeout(() => setInviteSuccess(false), 3000)
    } catch (error) {
      console.error('Error sending invite:', error)
    } finally {
      setInviteLoading(false)
    }
  }
  
  return (
    <div style={settingsStyles.container}>
      <div style={settingsStyles.content}>
        <section style={settingsStyles.section}>
          <h2 style={settingsStyles.sectionTitle}>🏠 {household?.name}</h2>
          
          <div style={settingsStyles.card}>
            <div style={settingsStyles.cardHeader}>
              <span style={settingsStyles.cardTitle}>{t('members')}</span>
              <span style={settingsStyles.badge}>{householdMembers.length}</span>
            </div>
            <div style={settingsStyles.membersList}>
              {householdMembers.map(member => (
                <div key={member.id} style={settingsStyles.memberItem}>
                  <div style={settingsStyles.avatar}>
                    {(member.display_name || 'U')[0].toUpperCase()}
                  </div>
                  <span style={settingsStyles.memberName}>
                    {member.display_name || member.id.slice(0, 8)}
                  </span>
                  {member.id === profile?.id && (
                    <span style={settingsStyles.youBadge}>vous</span>
                  )}
                </div>
              ))}
            </div>
            
            <form onSubmit={handleInvite} style={settingsStyles.inviteForm}>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder={t('inviteByEmail')}
                style={settingsStyles.inviteInput}
              />
              <button
                type="submit"
                disabled={inviteLoading || !inviteEmail.trim()}
                style={{
                  ...settingsStyles.inviteButton,
                  opacity: inviteLoading || !inviteEmail.trim() ? 0.6 : 1,
                }}
              >
                {inviteLoading ? '...' : t('sendInvite')}
              </button>
            </form>
            {inviteSuccess && (
              <p style={settingsStyles.successMessage}>
                ✓ Invitation envoyée !
              </p>
            )}
          </div>
        </section>
        
        <section style={settingsStyles.section}>
          <div style={settingsStyles.sectionHeader}>
            <h2 style={settingsStyles.sectionTitle}>🏷️ {t('manageTags')}</h2>
            <button
              onClick={() => {
                setActiveSection('tags')
                setEditingItem(null)
                setShowForm(true)
              }}
              style={settingsStyles.addButton}
            >
              + {t('add')}
            </button>
          </div>
          
          <div style={settingsStyles.itemsList}>
            {tags.map(tag => (
              <div key={tag.id} style={settingsStyles.item}>
                <span style={settingsStyles.itemIcon}>{tag.icon || '🏷️'}</span>
                <span style={settingsStyles.itemName}>{getName(tag)}</span>
                <button
                  onClick={() => {
                    setActiveSection('tags')
                    setEditingItem(tag)
                    setShowForm(true)
                  }}
                  style={settingsStyles.editButton}
                >
                  {t('edit')}
                </button>
              </div>
            ))}
          </div>
        </section>
        
        <section style={settingsStyles.section}>
          <div style={settingsStyles.sectionHeader}>
            <h2 style={settingsStyles.sectionTitle}>🍚 {t('manageBases')}</h2>
            <button
              onClick={() => {
                setActiveSection('bases')
                setEditingItem(null)
                setShowForm(true)
              }}
              style={settingsStyles.addButton}
            >
              + {t('add')}
            </button>
          </div>
          
          <div style={settingsStyles.itemsList}>
            {bases.map(base => (
              <div key={base.id} style={settingsStyles.item}>
                <span style={settingsStyles.itemName}>{getName(base)}</span>
                <button
                  onClick={() => {
                    setActiveSection('bases')
                    setEditingItem(base)
                    setShowForm(true)
                  }}
                  style={settingsStyles.editButton}
                >
                  {t('edit')}
                </button>
              </div>
            ))}
          </div>
        </section>
        
        <section style={settingsStyles.section}>
          <h2 style={settingsStyles.sectionTitle}>🌐 {t('language')}</h2>
          <div style={settingsStyles.languageToggle}>
            <button
              onClick={() => setLanguage('fr')}
              style={{
                ...settingsStyles.langButton,
                ...(language === 'fr' ? settingsStyles.langButtonActive : {}),
              }}
            >
              🇫🇷 Français
            </button>
            <button
              onClick={() => setLanguage('en')}
              style={{
                ...settingsStyles.langButton,
                ...(language === 'en' ? settingsStyles.langButtonActive : {}),
              }}
            >
              🇬🇧 English
            </button>
          </div>
        </section>
        
        <section style={settingsStyles.section}>
          <button onClick={signOut} style={settingsStyles.logoutButton}>
            {t('logout')}
          </button>
        </section>
      </div>
      
      {showForm && (
        <ItemForm
          type={activeSection}
          item={editingItem}
          onClose={() => {
            setShowForm(false)
            setEditingItem(null)
            setActiveSection(null)
          }}
          onSave={activeSection === 'tags' ? (editingItem ? updateTag : addTag) : (editingItem ? updateBase : addBase)}
          onDelete={activeSection === 'tags' ? deleteTag : deleteBase}
        />
      )}
    </div>
  )
}

function ItemForm({ type, item, onClose, onSave, onDelete }) {
  const { t } = useApp()
  const isEditing = !!item
  const [loading, setLoading] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  
  const [nameFr, setNameFr] = useState(item?.name_fr || '')
  const [nameEn, setNameEn] = useState(item?.name_en || '')
  const [icon, setIcon] = useState(item?.icon || '')
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!nameFr.trim()) return
    
    setLoading(true)
    try {
      const data = {
        name_fr: nameFr.trim(),
        name_en: nameEn.trim() || nameFr.trim(),
        ...(type === 'tags' ? { icon: icon.trim() } : {}),
      }
      
      if (isEditing) {
        await onSave(item.id, data)
      } else {
        await onSave(data)
      }
      onClose()
    } catch (error) {
      console.error('Error saving:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const handleDelete = async () => {
    setLoading(true)
    try {
      await onDelete(item.id)
      onClose()
    } catch (error) {
      console.error('Error deleting:', error)
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div style={formStyles.overlay} onClick={onClose}>
      <div style={formStyles.modal} onClick={e => e.stopPropagation()}>
        <div style={formStyles.header}>
          <h2 style={formStyles.title}>
            {isEditing 
              ? (type === 'tags' ? 'Modifier le tag' : 'Modifier le féculent')
              : (type === 'tags' ? t('addTag') : t('addBase'))
            }
          </h2>
          <button onClick={onClose} style={formStyles.closeButton}>✕</button>
        </div>
        
        <form onSubmit={handleSubmit} style={formStyles.form}>
          <div style={formStyles.field}>
            <label style={formStyles.label}>{t('nameFr')} *</label>
            <input
              type="text"
              value={nameFr}
              onChange={(e) => setNameFr(e.target.value)}
              required
              style={formStyles.input}
              autoFocus
            />
          </div>
          
          <div style={formStyles.field}>
            <label style={formStyles.label}>{t('nameEn')}</label>
            <input
              type="text"
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              style={formStyles.input}
            />
          </div>
          
          {type === 'tags' && (
            <div style={formStyles.field}>
              <label style={formStyles.label}>{t('icon')} (emoji)</label>
              <input
                type="text"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                placeholder="🏷️"
                style={{ ...formStyles.input, width: '80px' }}
                maxLength={4}
              />
            </div>
          )}
          
          <div style={formStyles.actions}>
            {isEditing && (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                style={formStyles.deleteButton}
              >
                {t('delete')}
              </button>
            )}
            <div style={formStyles.rightActions}>
              <button type="button" onClick={onClose} style={formStyles.cancelButton}>
                {t('cancel')}
              </button>
              <button
                type="submit"
                disabled={loading || !nameFr.trim()}
                style={{
                  ...formStyles.submitButton,
                  opacity: loading || !nameFr.trim() ? 0.7 : 1,
                }}
              >
                {loading ? t('loading') : t('save')}
              </button>
            </div>
          </div>
        </form>
        
        {showDeleteConfirm && (
          <div style={formStyles.confirmOverlay}>
            <div style={formStyles.confirmBox}>
              <p style={formStyles.confirmText}>Supprimer cet élément ?</p>
              <div style={formStyles.confirmActions}>
                <button onClick={() => setShowDeleteConfirm(false)} style={formStyles.cancelButton}>
                  {t('cancel')}
                </button>
                <button onClick={handleDelete} disabled={loading} style={formStyles.confirmDeleteButton}>
                  {loading ? t('loading') : t('delete')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const settingsStyles = {
  container: {
    height: '100%',
    overflow: 'auto',
    backgroundColor: theme.colors.background,
  },
  content: {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '16px',
  },
  section: {
    marginBottom: '24px',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: theme.colors.text,
    margin: 0,
  },
  addButton: {
    padding: '6px 12px',
    fontSize: '13px',
    fontWeight: '600',
    color: theme.colors.primary,
    backgroundColor: 'transparent',
    border: `1.5px solid ${theme.colors.primary}`,
    borderRadius: theme.borderRadius.md,
    cursor: 'pointer',
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    border: `1px solid ${theme.colors.borderLight}`,
    padding: '16px',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '12px',
  },
  cardTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: theme.colors.text,
  },
  badge: {
    padding: '2px 8px',
    backgroundColor: theme.colors.backgroundAlt,
    borderRadius: theme.borderRadius.full,
    fontSize: '12px',
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  membersList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '16px',
  },
  memberItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px 0',
  },
  avatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: theme.colors.primary,
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: '600',
  },
  memberName: {
    fontSize: '14px',
    color: theme.colors.text,
    flex: 1,
  },
  youBadge: {
    fontSize: '11px',
    color: theme.colors.textMuted,
    backgroundColor: theme.colors.backgroundAlt,
    padding: '2px 6px',
    borderRadius: theme.borderRadius.full,
  },
  inviteForm: {
    display: 'flex',
    gap: '8px',
    paddingTop: '12px',
    borderTop: `1px solid ${theme.colors.borderLight}`,
  },
  inviteInput: {
    flex: 1,
    padding: '10px 14px',
    fontSize: '14px',
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
  },
  inviteButton: {
    padding: '10px 16px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#fff',
    backgroundColor: theme.colors.primary,
    border: 'none',
    borderRadius: theme.borderRadius.md,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  successMessage: {
    color: theme.colors.success,
    fontSize: '13px',
    marginTop: '8px',
    textAlign: 'center',
  },
  itemsList: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    border: `1px solid ${theme.colors.borderLight}`,
    overflow: 'hidden',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 16px',
    borderBottom: `1px solid ${theme.colors.borderLight}`,
  },
  itemIcon: {
    fontSize: '16px',
  },
  itemName: {
    flex: 1,
    fontSize: '14px',
    color: theme.colors.text,
  },
  editButton: {
    fontSize: '13px',
    color: theme.colors.primary,
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontWeight: '500',
  },
  languageToggle: {
    display: 'flex',
    gap: '8px',
  },
  langButton: {
    flex: 1,
    padding: '14px',
    fontSize: '14px',
    fontWeight: '500',
    color: theme.colors.textSecondary,
    backgroundColor: theme.colors.surface,
    border: `1.5px solid ${theme.colors.border}`,
    borderRadius: theme.borderRadius.md,
    cursor: 'pointer',
    transition: theme.transitions.fast,
  },
  langButtonActive: {
    color: theme.colors.primary,
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.background,
  },
  logoutButton: {
    width: '100%',
    padding: '14px',
    fontSize: '15px',
    fontWeight: '600',
    color: theme.colors.error,
    backgroundColor: 'transparent',
    border: `1.5px solid ${theme.colors.error}`,
    borderRadius: theme.borderRadius.md,
    cursor: 'pointer',
  },
}

const formStyles = {
  overlay: {
    ...styles.modalOverlay,
  },
  modal: {
    ...styles.modalContent,
    maxWidth: '400px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px',
    borderBottom: `1px solid ${theme.colors.borderLight}`,
  },
  title: {
    fontSize: '18px',
    fontWeight: '600',
    color: theme.colors.text,
    margin: 0,
  },
  closeButton: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: theme.colors.backgroundAlt,
    border: 'none',
    fontSize: '16px',
    color: theme.colors.textSecondary,
    cursor: 'pointer',
  },
  form: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: theme.colors.text,
  },
  input: {
    ...styles.input,
  },
  actions: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '12px',
    borderTop: `1px solid ${theme.colors.borderLight}`,
  },
  rightActions: {
    display: 'flex',
    gap: '12px',
    marginLeft: 'auto',
  },
  cancelButton: {
    ...styles.buttonGhost,
  },
  submitButton: {
    ...styles.buttonPrimary,
  },
  deleteButton: {
    ...styles.buttonGhost,
    color: theme.colors.error,
  },
  confirmOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    borderRadius: theme.borderRadius.xl,
  },
  confirmBox: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: '24px',
    textAlign: 'center',
  },
  confirmText: {
    fontSize: '15px',
    color: theme.colors.text,
    margin: '0 0 20px 0',
  },
  confirmActions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
  },
  confirmDeleteButton: {
    ...styles.buttonPrimary,
    backgroundColor: theme.colors.error,
  },
}