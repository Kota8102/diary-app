import { useCallback } from 'react';
import { useNavigate as useReactRouterNavigate } from 'react-router-dom';

type NavigateFunction = (path: string) => void;

export const useNavigate = (): NavigateFunction => {
  const navigate = useReactRouterNavigate();

  const navigateTo = useCallback((path: string) => {
    navigate(path);
  }, [navigate]);

  return navigateTo;
};