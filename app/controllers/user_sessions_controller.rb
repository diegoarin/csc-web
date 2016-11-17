class UserSessionsController < ApplicationController
  #before_filter :require_no_user, only: [:create]
  before_filter :require_user, only: [:destroy]

  def create
    @user_session = UserSession.new(params[:user_session])
    if @user_session.save
      render json: {data: @user_session.record}, status: 201
    else
      render json: @user_session.errors, status: 422
    end
  end

  def destroy
    if current_user_session.destroy
      render json: true, status: 201
    else
      render json: current_user_session.errors, status: 422
    end
  end
end
