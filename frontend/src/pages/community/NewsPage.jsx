import { useMemo, useState } from 'react'
import { NEWS_ARTICLES, NEWS_CATEGORIES } from './newsData'

const categoryLabel = (key) => {
  const category = NEWS_CATEGORIES.find((item) => item.key === key)
  return category?.label || 'Tin tức'
}

export default function NewsPage() {
  const [searchText, setSearchText] = useState('')
  const [activeCategory, setActiveCategory] = useState('ALL')

  const filteredArticles = useMemo(() => {
    return NEWS_ARTICLES.filter((article) => {
      const matchesCategory = activeCategory === 'ALL' || article.category === activeCategory
      const matchesSearch = [article.title, article.summary, categoryLabel(article.category)]
        .join(' ')
        .toLowerCase()
        .includes(searchText.toLowerCase())
      return matchesCategory && matchesSearch
    })
  }, [searchText, activeCategory])

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-[28px] bg-white p-8 shadow-sm border border-slate-200">
          <div className="mb-10 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-600">Tin tức cộng đồng</p>
            <h1 className="mt-4 text-4xl font-extrabold text-slate-900 sm:text-5xl">
              Kiến thức quản lý sân thể thao
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm text-slate-600 sm:text-base">
              Tổng hợp tin tức, hướng dẫn, xu hướng và giải pháp kinh doanh sân bóng dành cho chủ sân và người chơi.
            </p>
          </div>

          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1">
              <label htmlFor="news-search" className="sr-only">Tìm bài viết</label>
              <input
                id="news-search"
                type="text"
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                placeholder="Tìm bài viết theo từ khóa..."
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.8fr_1fr]">
            <div className="space-y-6">
              {filteredArticles.length > 0 ? (
                filteredArticles.map((article) => (
                  <article key={article.id} className="overflow-hidden rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm transition hover:-translate-y-1">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <span className="rounded-full bg-emerald-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                        {categoryLabel(article.category)}
                      </span>
                      <div className="text-sm text-slate-500">
                        <span>{article.date}</span>
                        <span className="mx-2">•</span>
                        <span>{article.readingTime}</span>
                      </div>
                    </div>
                    <h2 className="mt-5 text-2xl font-bold text-slate-900 sm:text-3xl">
                      {article.title}
                    </h2>
                    <p className="mt-4 text-sm leading-7 text-slate-600">
                      {article.summary}
                    </p>
                    <button className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#60D86E] transition hover:text-[#45c45a]">
                      Xem thêm
                      <span aria-hidden="true">→</span>
                    </button>
                  </article>
                ))
              ) : (
                <div className="rounded-[32px] border border-dashed border-slate-300 bg-slate-50 p-16 text-center text-slate-500">
                  <p className="text-lg font-medium">Không tìm thấy bài viết phù hợp.</p>
                  <p className="mt-2 text-sm">Hãy thử đổi từ khóa hoặc chọn mục khác.</p>
                </div>
              )}
            </div>

            <aside className="self-start space-y-6 rounded-[32px] border border-slate-200 bg-slate-950 p-6 text-white shadow-sm">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-emerald-300">Chuyên mục</p>
                <h3 className="mt-3 text-2xl font-bold">Bài viết nổi bật</h3>
                <p className="mt-2 text-sm text-slate-300">
                  Chọn một chủ đề để chỉ hiển thị tin tức liên quan đến lĩnh vực bạn quan tâm.
                </p>
              </div>

              <div className="space-y-3">
                {NEWS_CATEGORIES.map((category) => {
                  const isActive = activeCategory === category.key
                  return (
                    <button
                      key={category.key}
                      type="button"
                      onClick={() => setActiveCategory(category.key)}
                      className={`w-full rounded-3xl border px-5 py-4 text-left transition ${
                        isActive
                          ? 'border-emerald-500 bg-emerald-600/10 text-white shadow-sm'
                          : 'border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-600 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-semibold">{category.label}</span>
                        {isActive && <span className="rounded-full bg-emerald-500 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-white">Hiện</span>}
                      </div>
                      <p className="mt-2 text-xs leading-5 text-slate-300">{category.description}</p>
                    </button>
                  )
                })}
              </div>
            </aside>
          </div>
        </div>
      </div>
    </main>
  )
}
