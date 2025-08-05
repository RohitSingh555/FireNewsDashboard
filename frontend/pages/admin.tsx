import dynamic from 'next/dynamic';

// Loading component for admin page
const AdminLoading = () => (
  <div className="flex items-center justify-center min-h-screen bg-theme-background">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-theme-teal-dark mx-auto mb-4"></div>
      <span className="text-theme-teal-dark text-xl font-bold">Loading Admin Panel...</span>
    </div>
  </div>
);

// Dynamically import AdminPage with no SSR
const AdminPage = dynamic(() => import('../components/AdminPage'), {
  ssr: false,
  loading: AdminLoading,
});

export default function Admin() {
  return <AdminPage />;
}

// Ensure this page is client-side rendered
export const getServerSideProps = async () => {
  return {
    props: {},
  };
}; 