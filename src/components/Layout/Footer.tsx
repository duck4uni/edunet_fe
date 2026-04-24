import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUp } from 'lucide-react';
import {
  EnvironmentOutlined,
  FacebookFilled,
  InstagramFilled,
  LinkedinFilled,
  MailOutlined,
  PhoneOutlined,
  YoutubeFilled,
} from '@ant-design/icons';
import SettingBear from '../../assets/images/Panda/SittingBear.png';

const quickLinks = [
  { to: '/', label: 'Giới thiệu' },
  { to: '/courses', label: 'Khóa học' },
  { to: '/my-course', label: 'Khóa học của tôi' },
  { to: '/schedule', label: 'Lịch học' },
  { to: '/chat', label: 'Tin nhắn' },
];

const services = [
  'Thiết kế chương trình đào tạo',
  'Tư vấn lộ trình học tập',
  'Đào tạo doanh nghiệp',
  'Hệ thống LMS tùy chỉnh',
  'Hỗ trợ giảng viên 1-1',
];

const socialLinks = [
  { href: 'https://facebook.com/academix', label: 'Facebook', icon: <FacebookFilled /> },
  { href: 'https://instagram.com/academix', label: 'Instagram', icon: <InstagramFilled /> },
  { href: 'https://linkedin.com/company/academix', label: 'LinkedIn', icon: <LinkedinFilled /> },
  { href: 'https://youtube.com/@academix', label: 'YouTube', icon: <YoutubeFilled /> },
];

const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="mt-12 w-full overflow-hidden border-t border-[rgba(48,194,236,0.24)] bg-[linear-gradient(180deg,rgba(48,194,236,0.08)_0%,rgba(255,255,255,0.94)_36%,#ffffff_100%)]">
      <div className="mx-auto w-full max-w-none px-[22px] pb-5 pt-6 sm:px-[22px] lg:px-[22px]">
        <div className="mb-5 rounded-2xl border border-[rgba(48,194,236,0.24)] bg-white/95 p-4 shadow-[0_8px_20px_rgba(2,40,72,0.06)]">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-[15px] font-semibold text-[var(--primaryColor)]">Học tập chuyên nghiệp cùng Academix</h2>
              <p className="mt-1 max-w-[620px] text-[12px] leading-5 text-slate-600">
                Nền tảng đào tạo hiện đại cho cá nhân và doanh nghiệp, tập trung vào lộ trình học thực tế và hiệu quả.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-[12px]">
              <a
                href="mailto:info@academix.vn"
                className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(48,194,236,0.28)] bg-[rgba(48,194,236,0.08)] px-3 py-1.5 text-[var(--primaryColor)] transition hover:border-[var(--textState500Secondary)] hover:text-[var(--textState500Secondary)]"
              >
                <MailOutlined /> info@academix.vn
              </a>
              <a
                href="tel:19001234"
                className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(48,194,236,0.28)] bg-[rgba(48,194,236,0.08)] px-3 py-1.5 text-[var(--primaryColor)] transition hover:border-[var(--textState500Secondary)] hover:text-[var(--textState500Secondary)]"
              >
                <PhoneOutlined /> 1900 1234
              </a>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <section className="rounded-xl border border-[rgba(48,194,236,0.2)] bg-white p-4 shadow-[0_6px_14px_rgba(2,40,72,0.05)]">
            <div className="mb-2.5 flex items-start justify-between gap-2">
              <h3 className="text-[14px] font-semibold text-[var(--primaryColor)]">Academix</h3>
              <img src={SettingBear} alt="Academix mascot" className="h-14 w-14 object-contain" />
            </div>
            <p className="text-[12px] leading-5 text-slate-600">
              Đào tạo theo chuẩn thực chiến, tích hợp LMS thông minh và hỗ trợ theo từng cấp độ học viên.
            </p>
            <div className="mt-3 flex items-center gap-2">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[rgba(48,194,236,0.24)] bg-[rgba(48,194,236,0.08)] text-[var(--textState500Secondary)] transition hover:border-[var(--textState500Secondary)] hover:bg-[rgba(48,194,236,0.16)]"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-[rgba(48,194,236,0.2)] bg-white p-4 shadow-[0_6px_14px_rgba(2,40,72,0.05)]">
            <h3 className="mb-2.5 text-[13px] font-semibold uppercase tracking-[0.06em] text-[var(--primaryColor)]">Liên kết nhanh</h3>
            <ul className="space-y-2 text-[13px] text-slate-600">
              {quickLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="transition hover:text-[var(--textState500Secondary)]">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-xl border border-[rgba(48,194,236,0.2)] bg-white p-4 shadow-[0_6px_14px_rgba(2,40,72,0.05)]">
            <h3 className="mb-2.5 text-[13px] font-semibold uppercase tracking-[0.06em] text-[var(--primaryColor)]">Dịch vụ</h3>
            <ul className="space-y-2 text-[13px] text-slate-600">
              {services.map((service) => (
                <li key={service}>{service}</li>
              ))}
            </ul>
          </section>

          <section className="rounded-xl border border-[rgba(48,194,236,0.2)] bg-white p-4 shadow-[0_6px_14px_rgba(2,40,72,0.05)]">
            <h3 className="mb-2.5 text-[13px] font-semibold uppercase tracking-[0.06em] text-[var(--primaryColor)]">Thông tin liên hệ</h3>
            <ul className="space-y-2 text-[13px] text-slate-600">
              <li className="flex items-start gap-2">
                <MailOutlined className="mt-0.5 text-[var(--textState500Secondary)]" />
                <a href="mailto:info@academix.vn" className="transition hover:text-[var(--textState500Secondary)]">
                  info@academix.vn
                </a>
              </li>
              <li className="flex items-start gap-2">
                <PhoneOutlined className="mt-0.5 text-[var(--textState500Secondary)]" />
                <a href="tel:19001234" className="transition hover:text-[var(--textState500Secondary)]">1900 1234</a>
              </li>
              <li className="flex items-start gap-2">
                <EnvironmentOutlined className="mt-0.5 text-[var(--textState500Secondary)]" />
                <span>Tầng 12, Toà nhà Academix, TP. Hồ Chí Minh</span>
              </li>
              <li>
                <a
                  href="https://linkedin.com/company/academix"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition hover:text-[var(--textState500Secondary)]"
                >
                  linkedin.com/company/academix
                </a>
              </li>
            </ul>
          </section>
        </div>

        <div className="mt-5 flex flex-col gap-2 border-t border-[rgba(48,194,236,0.22)] pt-4 text-[12px] text-slate-500 md:flex-row md:items-center md:justify-between">
          <p>Academix ©{new Date().getFullYear()} Được phát triển bởi Academix Team</p>
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="transition hover:text-[var(--textState500Secondary)]">Chính sách bảo mật</Link>
            <Link to="/terms" className="transition hover:text-[var(--textState500Secondary)]">Điều khoản dịch vụ</Link>
            <button
              onClick={scrollToTop}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[rgba(48,194,236,0.24)] bg-white text-gray-500 transition hover:border-[var(--textState500Secondary)] hover:text-[var(--textState500Secondary)]"
              aria-label="Lên đầu trang"
            >
              <ArrowUp size={14} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
