import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import { useTranslations } from '@/hooks/useTranslations';
import { openModal } from '@/slices/common/commonSlice';

/**
 * Custom hook for handling authentication-based modal opening
 * If user is not authenticated, opens login modal instead of the requested modal
 * If user is authenticated, opens the requested modal with optional props
 */
export const useAuthModal = () => {
  const dispatch = useDispatch();
  const { t } = useTranslations();
  const isAuth = useSelector((state) => state.auth.isAuth);

  /**
   * Opens a modal with authentication check
   * @param {string|object} modalConfig - Modal name string or object with modal and props
   * @param {string} modalConfig.modal - Modal name
   * @param {object} modalConfig.props - Optional modal props
   */
  const openAuthModal = (modalConfig) => {
    if (!isAuth) {
      toast.info(t('please_log_in_to_continue'));
      dispatch(openModal('login'));
      return;
    }

    // If user is authenticated, open the requested modal
    if (typeof modalConfig === 'string') {
      dispatch(openModal(modalConfig));
    } else if (modalConfig && typeof modalConfig === 'object') {
      dispatch(openModal(modalConfig));
    }
  };

  return { openAuthModal, isAuth };
};
