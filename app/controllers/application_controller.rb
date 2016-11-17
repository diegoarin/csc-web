class ApplicationController < ActionController::Base
  #before_filter :require_user
  helper_method :current_user_session, :current_user

  private
    def current_user_session
      return @current_user_session if defined?(@current_user_session)
      @current_user_session = UserSession.find
    end

    def current_user
      return @current_user if defined?(@current_user)
      @current_user = current_user_session && current_user_session.user
    end

    def require_user
      unless current_user
        render json: {message: 'You must be logged in to access this page'}, status: 401
      end
    end

    def require_no_user
      if current_user
        render json: {message: 'You must be logged out to access this page'}, status: 401
      end
    end

    def require_admin
      unless current_user.admin?
        render json: {message: 'You must be logged in to access this page'}, status: 401
      end
    end
end
