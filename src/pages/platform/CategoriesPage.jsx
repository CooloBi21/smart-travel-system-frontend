import {
  FolderTree,
  Info,
  Tags,
} from 'lucide-react';

import PageContainer from '../../components/layout/PageContainer';

export default function CategoriesPage() {
  return (
    <PageContainer>
      <section className="platform-page-header">
        <div>
          <span className="platform-page-eyebrow">
            CATEGORY MANAGEMENT
          </span>

          <h1>Danh mục</h1>

          <p>
            Quản lý các nhóm danh mục được sử dụng trong
            hệ thống Smart Travel.
          </p>
        </div>
      </section>

      <section className="platform-placeholder-card">
        <div className="platform-placeholder-icon">
          <Tags size={24} />
        </div>

        <h2>Category management đang chờ API</h2>

        <p>
          Giao diện quản trị danh mục đã được chuẩn bị
          theo kiến trúc Platform Admin. Backend hiện
          chưa cung cấp API CRUD danh mục cho Platform
          Admin nên hệ thống chưa thực hiện thao tác
          tạo, cập nhật hoặc xóa dữ liệu tại khu vực này.
        </p>

        <div className="platform-capability">
          <FolderTree size={18} />

          <span>
            Category API:
            <strong> NOT AVAILABLE</strong>
          </span>
        </div>

        <div className="platform-info-note">
          <Info size={17} />

          <span>
            Phần này sẽ được nối với backend khi module
            quản lý danh mục được triển khai.
          </span>
        </div>
      </section>
    </PageContainer>
  );
}
