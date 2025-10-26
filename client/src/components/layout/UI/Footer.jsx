// components/SimpleFooter.jsx
const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-600">
            © 2024 FinanceApp. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-2 md:mt-0">
            <a href="/privacy" className="text-sm text-gray-600 hover:text-gray-900">
              Privacy Policy
            </a>
            <a href="/terms" className="text-sm text-gray-600 hover:text-gray-900">
              Terms of Service
            </a>
            <a href="/support" className="text-sm text-gray-600 hover:text-gray-900">
              Support
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;