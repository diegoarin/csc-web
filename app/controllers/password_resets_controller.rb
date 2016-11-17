class PasswordResetsController < ApplicationController
  before_filter :require_no_user
  before_filter :load_user_using_perishable_token, only: [:update]

  def create
    @user = User.find_by_email(params[:email])
    if @user
      if @user.deliver_password_reset_instructions!
        render json: true, status: 201
      else
        render json: false, status: 422
      end
    else
      render json: {error: true, data: "No se encontr&oacute; ningun usuario con el email #{params[:email]}"}, status: 422
    end
  end

  def update
    @user.password = params[:password]
    @user.password_confirmation = params[:password_confirmation]
    # Use @user.save_without_session_maintenance instead if you don't want the user to be signed in automatically.
    if @user.save
      render json: {logged: true, data: @user}, status: 201
    else
      render json: {logged: false, data: @user.errors}
    end
  end

  private

  def load_user_using_perishable_token
    @user = User.find_using_perishable_token(params[:id])
    unless @user
      render json: {error: true, data: "Lo sentimos, no pudimos localizar su cuenta"}
    end
  end

end
