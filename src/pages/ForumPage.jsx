import { useEffect, useState } from 'react'
import PageHeader from '../components/PageHeader'
import Modal from '../components/Modal'
import Badge from '../components/Badge'
import { forumApi } from '../api/modules'
import { useAuth } from '../auth/AuthContext'
import { formatDateTime } from '../utils/formatters'

const emptyPost = { title: '', content: '', category: '', isPinned: false, isLocked: false }

export default function ForumPage() {
  const { user } = useAuth()
  const [posts, setPosts] = useState([])
  const [keyword, setKeyword] = useState('')
  const [category, setCategory] = useState('')
  const [openPostModal, setOpenPostModal] = useState(false)
  const [editingPost, setEditingPost] = useState(null)
  const [postForm, setPostForm] = useState(emptyPost)
  const [activePost, setActivePost] = useState(null)
  const [comments, setComments] = useState([])
  const [commentText, setCommentText] = useState('')
  const [editingCommentId, setEditingCommentId] = useState(null)
  const [error, setError] = useState('')

  const loadPosts = async () => {
    try {
      const data = await forumApi.getPosts({ keyword: keyword || undefined, category: category || undefined, page: 0, size: 50 })
      setPosts(data?.content || [])
      setError('')
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Không tải được diễn đàn.')
    }
  }

  useEffect(() => {
    loadPosts()
  }, [])

  const openCreate = () => {
    setEditingPost(null)
    setPostForm(emptyPost)
    setOpenPostModal(true)
  }

  const openEdit = (post) => {
    setEditingPost(post)
    setPostForm({
      title: post.title || '',
      content: post.content || '',
      category: post.category || '',
      isPinned: Boolean(post.isPinned),
      isLocked: Boolean(post.isLocked),
    })
    setOpenPostModal(true)
  }

  const savePost = async (event) => {
    event.preventDefault()
    try {
      if (editingPost) await forumApi.updatePost(editingPost.id, postForm)
      else await forumApi.createPost(postForm)
      setOpenPostModal(false)
      setPostForm(emptyPost)
      await loadPosts()
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Không thể lưu bài viết.')
    }
  }

  const removePost = async (post) => {
    if (!window.confirm('Xóa bài viết này?')) return
    try {
      await forumApi.deletePost(post.id)
      if (activePost?.id === post.id) {
        setActivePost(null)
        setComments([])
      }
      await loadPosts()
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Không thể xóa bài viết.')
    }
  }

  const openThread = async (post) => {
    try {
      const [detail, commentData] = await Promise.all([
        forumApi.getPostById(post.id),
        forumApi.getComments(post.id),
      ])
      setActivePost(detail)
      setComments(commentData || [])
      setCommentText('')
      setEditingCommentId(null)
      await loadPosts()
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Không thể tải nội dung bài viết.')
    }
  }

  const submitComment = async (event) => {
    event.preventDefault()
    if (!activePost) return
    try {
      if (editingCommentId) {
        await forumApi.updateComment(editingCommentId, { content: commentText })
      } else {
        await forumApi.createComment(activePost.id, { content: commentText })
      }
      const refreshed = await forumApi.getComments(activePost.id)
      setComments(refreshed || [])
      setCommentText('')
      setEditingCommentId(null)
      await loadPosts()
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Không thể gửi bình luận.')
    }
  }

  const editComment = (comment) => {
    setEditingCommentId(comment.id)
    setCommentText(comment.content || '')
  }

  const deleteComment = async (comment) => {
    if (!window.confirm('Xóa bình luận này?')) return
    try {
      await forumApi.deleteComment(comment.id)
      const refreshed = await forumApi.getComments(activePost.id)
      setComments(refreshed || [])
      await loadPosts()
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Không thể xóa bình luận.')
    }
  }

  return (
    <div className="page-grid">
      <PageHeader
        title="Diễn đàn nội bộ"
        subtitle="Trao đổi nghiệp vụ, chia sẻ tình huống xử lý và cập nhật thông tin vận hành trong hệ thống bảo trì."
        actions={<button className="primary-btn" onClick={openCreate}>Tạo bài viết</button>}
      />

      <div className="filters glass-card two-inputs">
        <input placeholder="Tìm theo tiêu đề hoặc nội dung..." value={keyword} onChange={(e) => setKeyword(e.target.value)} />
        <input placeholder="Lọc theo chuyên mục..." value={category} onChange={(e) => setCategory(e.target.value)} />
        <button className="ghost-btn" onClick={loadPosts}>Lọc</button>
      </div>

      {error ? <div className="error-box">{error}</div> : null}

      <div className="forum-layout">
        <section className="glass-card forum-list">
          {posts.length === 0 ? <div className="empty-state">Chưa có bài viết nào.</div> : posts.map((post) => (
            <article key={post.id} className={`forum-post-card ${activePost?.id === post.id ? 'active' : ''}`}>
              <button className="forum-post-main" onClick={() => openThread(post)}>
                <div className="forum-post-head">
                  <div className="forum-post-badges">
                    {post.category ? <Badge tone="info">{post.category}</Badge> : null}
                    {post.isPinned ? <Badge tone="warning">Ghim</Badge> : null}
                    {post.isLocked ? <Badge tone="danger">Khóa bình luận</Badge> : null}
                  </div>
                  <strong>{post.title}</strong>
                </div>
                <p className="muted forum-snippet">{post.content}</p>
                <div className="forum-meta">
                  <span>{post.authorName || 'Không rõ tác giả'}</span>
                  <span>{post.commentCount || 0} bình luận</span>
                  <span>{formatDateTime(post.updatedAt || post.createdAt)}</span>
                </div>
              </button>
              {post.authorId === user?.id ? (
                <div className="table-actions forum-actions">
                  <button className="ghost-btn" onClick={() => openEdit(post)}>Sửa</button>
                  <button className="danger-btn" onClick={() => removePost(post)}>Xóa</button>
                </div>
              ) : null}
            </article>
          ))}
        </section>

        <section className="glass-card forum-thread">
          {activePost ? (
            <>
              <div className="forum-thread-head">
                <div>
                  <div className="forum-post-badges">
                    {activePost.category ? <Badge tone="info">{activePost.category}</Badge> : null}
                    {activePost.isPinned ? <Badge tone="warning">Ghim</Badge> : null}
                    {activePost.isLocked ? <Badge tone="danger">Khóa bình luận</Badge> : null}
                  </div>
                  <h3>{activePost.title}</h3>
                  <p className="muted">{activePost.authorName || 'Không rõ tác giả'} • {formatDateTime(activePost.updatedAt || activePost.createdAt)}</p>
                </div>
              </div>
              <div className="forum-content">{activePost.content}</div>

              <div className="forum-comment-list">
                {comments.map((comment) => (
                  <div key={comment.id} className="forum-comment-card">
                    <div className="forum-meta">
                      <strong>{comment.authorName || 'Người dùng'}</strong>
                      <span>{formatDateTime(comment.updatedAt || comment.createdAt)}</span>
                    </div>
                    <p>{comment.content}</p>
                    {comment.authorId === user?.id ? (
                      <div className="table-actions forum-actions">
                        <button className="ghost-btn" onClick={() => editComment(comment)}>Sửa</button>
                        <button className="danger-btn" onClick={() => deleteComment(comment)}>Xóa</button>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>

              {!activePost.isLocked ? (
                <form className="form-grid" onSubmit={submitComment}>
                  <textarea placeholder="Viết bình luận..." value={commentText} onChange={(e) => setCommentText(e.target.value)} required />
                  <div className="form-actions">
                    {editingCommentId ? <button className="ghost-btn" type="button" onClick={() => { setEditingCommentId(null); setCommentText('') }}>Hủy sửa</button> : null}
                    <button className="primary-btn" type="submit">{editingCommentId ? 'Cập nhật bình luận' : 'Gửi bình luận'}</button>
                  </div>
                </form>
              ) : (
                <div className="empty-state">Bài viết này đang tạm khóa bình luận.</div>
              )}
            </>
          ) : <div className="empty-state">Chọn một bài viết để xem nội dung và bình luận.</div>}
        </section>
      </div>

      <Modal open={openPostModal} title={editingPost ? 'Cập nhật bài viết' : 'Tạo bài viết mới'} onClose={() => setOpenPostModal(false)}>
        <form className="form-grid" onSubmit={savePost}>
          <input placeholder="Tiêu đề" value={postForm.title} onChange={(e) => setPostForm({ ...postForm, title: e.target.value })} required />
          <input placeholder="Chuyên mục" value={postForm.category} onChange={(e) => setPostForm({ ...postForm, category: e.target.value })} />
          <textarea placeholder="Nội dung" value={postForm.content} onChange={(e) => setPostForm({ ...postForm, content: e.target.value })} required />
          <div className="inline-checkbox-row">
            <label><input type="checkbox" checked={postForm.isPinned} onChange={(e) => setPostForm({ ...postForm, isPinned: e.target.checked })} /> Ghim bài viết</label>
            <label><input type="checkbox" checked={postForm.isLocked} onChange={(e) => setPostForm({ ...postForm, isLocked: e.target.checked })} /> Khóa bình luận</label>
          </div>
          <div className="form-actions">
            <button className="primary-btn" type="submit">Lưu bài viết</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
